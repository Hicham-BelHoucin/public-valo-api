import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FundFilterDto, PerformanceResponseDto } from './dto/fund.dto';

@Injectable()
export class FundService {
  constructor(private prisma: PrismaService) {}

  // Get all public funds with pagination (with caching disabled)
  async findAllPublic(
    filter?: FundFilterDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    // Pagination parameters
    const page = filter?.page ? parseInt(filter.page, 10) : 1;
    const limit = filter?.limit ? parseInt(filter.limit, 10) : 20;
    const locale = filter?.locale || 'fr';

    // Fetch all funds (we need all to sort by YTD across the entire set, then paginate)
    const [funds, total] = await this.prisma.$transaction([
      this.prisma.fund.findMany({
        include: {
          category: {
            select: { nameFr: true, nameEn: true },
          },
          distributors: true,
          fundUserAssignments: {
            include: {
              user: true,
            },
          },
          translations: {
            where: { locale },
            select: {
              name: true,
              investmentObjective: true,
              fundComposition: true,
              legalForm: true,
              resultsAllocation: true,
              navFrequency: true,
              investmentHorizon: true,
            },
          },
          fundPreview: true,
        },
        orderBy: { createdAt: 'desc' },
        // Note: do not skip/take here because we need to sort by computed YTD across all funds,
        // then apply pagination after sorting.
      }),
      this.prisma.fund.count(),
    ]);

    // Compute YTD (and small performance summary) for each fund in parallel
    const metricsForFunds = await Promise.all(
      funds.map((f) => this.getFundPerformanceMetrics(f.id)),
    );

    console.log(metricsForFunds);

    // Transform each fund to match the same format as findOne and attach ytdPerformance
    const transformedFunds = funds.map((fund, idx) => {
      const t = fund.translations[0] || {};
      const metrics = metricsForFunds[idx] || {};
      const ytd = metrics.ytdPerformance;

      return {
        id: fund.id,
        fundCode: fund.fundCode,
        objectifDePlacement: t.investmentObjective,
        compositionDuFonds: t.fundComposition,
        name: t.name,
        _ytdPerformance: typeof ytd === 'number' ? ytd : undefined, // internal field for sorting

        caracteristiquesGenerales: {
          codeISIN: fund.isinCode || 'N/A',
          formeJuridique: t.legalForm || 'N/A',
          classification: fund.category?.nameFr || 'N/A',
          dateCreation: fund.creationDate?.toISOString().split('T')[0] || 'N/A',
          frequence: t.navFrequency || 'N/A',
          derniereVL:
            fund.navValue?.toNumber().toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
            }) + ' MAD' || 'N/A',
          actifsNets:
            fund.netAssets?.toNumber().toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
            }) + ' MAD' || 'N/A',
          affectationDesResultats: t.resultsAllocation || 'N/A',
          benchmark: fund.benchmarkIndex || 'N/A',
          depositary: fund.depositary || 'N/A',
          fourchetteSensibilite: fund.sensitivityRange || 'N/A',
          dureePlacementRecommandee: t.investmentHorizon || 'N/A',
        },
      };
    });

    // Sort by YTD descending. Funds with undefined YTD go to the end.
    transformedFunds.sort((a, b) => {
      const ay = a._ytdPerformance;
      const by = b._ytdPerformance;
      if (ay === undefined && by === undefined) return 0;
      if (ay === undefined) return 1; // a after b
      if (by === undefined) return -1; // a before b
      return by - ay; // descending
    });

    // Apply pagination on the sorted list
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = transformedFunds;

    return { data: paginated, total, page, limit };
  }

  // Get a fund by ID with locale and preview support
  async findOne(id: string, locale: string = 'fr'): Promise<any> {
    const fund = await this.prisma.fund.findUnique({
      where: { id },
      include: {
        translations: {
          where: { locale },
          select: {
            name: true,
            investmentObjective: true,
            fundComposition: true,
            legalForm: true,
            resultsAllocation: true,
            navFrequency: true,
            investmentHorizon: true,
          },
        },
        category: {
          select: { nameFr: true, nameEn: true },
        },
        fundUserAssignments: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                department: true,
                position: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!fund) return { error: 'Fund not found' };

    const t = fund.translations[0] || {};

    // Transform team assignments
    const team = fund.fundUserAssignments.map((assignment) => ({
      id: assignment.user.id,
      firstName: assignment.user.firstName,
      lastName: assignment.user.lastName,
      email: assignment.user.email,
      role: assignment.user.role,
      department: assignment.user.department,
      position: assignment.user.position,
      profileImageUrl: assignment.user.profileImageUrl,
      assignmentRole: assignment.role,
    }));

    // Get performance metrics
    const performanceMetrics = await this.getFundPerformanceMetrics(id);

    return {
      id: fund.id,
      fundCode: fund.fundCode,
      name: t.name,
      objectifDePlacement: t.investmentObjective,
      compositionDuFonds: t.fundComposition,
      team,
      performance: performanceMetrics,
      caracteristiquesGenerales: {
        codeISIN: fund.isinCode || 'N/A',
        formeJuridique: t.legalForm || 'N/A',
        classification: fund.category?.nameFr || 'N/A',
        dateCreation: fund.creationDate?.toISOString().split('T')[0] || 'N/A',
        frequence: t.navFrequency || 'N/A',
        derniereVL:
          fund.navValue?.toNumber().toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
          }) + ' MAD' || 'N/A',
        actifsNets:
          fund.netAssets?.toNumber().toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
          }) + ' MAD' || 'N/A',
        affectationDesResultats: t.resultsAllocation || 'N/A',
        benchmark: fund.benchmarkIndex || 'N/A',
        depositary: fund.depositary || 'N/A',
        fourchetteSensibilite: fund.sensitivityRange || 'N/A',
        dureePlacementRecommandee: t.investmentHorizon || 'N/A',
      },
    };
  }

  async findOneByFundCode(
    fundCode: string,
    locale: string = 'fr',
  ): Promise<any> {
    const fund = await this.prisma.fund.findUnique({
      where: { fundCode },
      include: {
        translations: {
          where: { locale },
          select: {
            name: true,
            investmentObjective: true,
            fundComposition: true,
            legalForm: true,
            resultsAllocation: true,
            navFrequency: true,
            investmentHorizon: true,
          },
        },
        category: {
          select: { nameFr: true, nameEn: true },
        },
        fundUserAssignments: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                department: true,
                position: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!fund) return { error: 'Fund not found' };

    const t = fund.translations[0] || {};

    // Transform team assignments
    const team = fund.fundUserAssignments.map((assignment) => ({
      id: assignment.user.id,
      firstName: assignment.user.firstName,
      lastName: assignment.user.lastName,
      email: assignment.user.email,
      role: assignment.user.role,
      department: assignment.user.department,
      position: assignment.user.position,
      profileImageUrl: assignment.user.profileImageUrl,
      assignmentRole: assignment.role,
    }));

    // Get performance metrics
    const performanceMetrics = await this.getFundPerformanceMetrics(fund.id);

    return {
      id: fund.id,
      fundCode: fund.fundCode,
      name: t.name,
      objectifDePlacement: t.investmentObjective,
      compositionDuFonds: t.fundComposition,
      team,
      performance: performanceMetrics,
      caracteristiquesGenerales: {
        codeISIN: fund.isinCode || 'N/A',
        formeJuridique: t.legalForm || 'N/A',
        classification: fund.category?.nameFr || 'N/A',
        dateCreation: fund.creationDate?.toISOString().split('T')[0] || 'N/A',
        frequence: t.navFrequency || 'N/A',
        derniereVL:
          fund.navValue?.toNumber().toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
          }) + ' MAD' || 'N/A',
        actifsNets:
          fund.netAssets?.toNumber().toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
          }) + ' MAD' || 'N/A',
        affectationDesResultats: t.resultsAllocation || 'N/A',
        benchmark: fund.benchmarkIndex || 'N/A',
        depositary: fund.depositary || 'N/A',
        fourchetteSensibilite: fund.sensitivityRange || 'N/A',
        dureePlacementRecommandee: t.investmentHorizon || 'N/A',
      },
    };
  }

  // Get fund performance data with all historical metrics
  async getPerformanceByDateRange(
    fundId: string,
  ): Promise<PerformanceResponseDto> {
    // First, verify the fund exists
    const fund = await this.prisma.fund.findUnique({
      where: { id: fundId },
      select: { id: true, fundCode: true, creationDate: true },
    });

    if (!fund) {
      throw new NotFoundException('Fund not found');
    }

    // Get all valuations for the fund from the beginning
    const allValuations = await this.prisma.fundValuation.findMany({
      where: {
        fundId,
      },
      orderBy: { date: 'asc' },
    });

    if (allValuations.length === 0) {
      return {
        fundId: fund.id,
        fundCode: fund.fundCode,
        performance: [],
        summary: {},
      };
    }

    // Transform all valuations to performance data
    const performance = allValuations.map((valuation) => ({
      date: valuation.date.toISOString().split('T')[0],
      nav: valuation.nav.toNumber(),
      an: valuation.an.toNumber(),
    }));

    // Calculate various performance metrics
    const endNav = allValuations[allValuations.length - 1].nav.toNumber();
    const startNav = allValuations[0].nav.toNumber();
    const endDate = allValuations[allValuations.length - 1].date;
    const lastValuationDate = endDate.toISOString().split('T')[0];

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      allValuations,
      endDate,
      fund.creationDate,
    );

    // Calculate yesterday performance
    const yesterday = new Date(endDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayNav = this.findNavForDate(allValuations, yesterday);
    let yesterdayPerformance: number | undefined;
    if (yesterdayNav) {
      yesterdayPerformance = ((endNav - yesterdayNav) / yesterdayNav) * 100;
    }

    // Calculate last variation
    let lastVariation: number | undefined;
    if (allValuations.length >= 2) {
      const lastNav = allValuations[allValuations.length - 1].nav.toNumber();
      const previousNav =
        allValuations[allValuations.length - 2].nav.toNumber();
      lastVariation = ((lastNav - previousNav) / previousNav) * 100;
    }

    // Calculate overall statistics
    const allNavs = allValuations.map((v) => v.nav.toNumber());
    const maxNav = Math.max(...allNavs);
    const minNav = Math.min(...allNavs);
    const totalDays = allValuations.length;

    // Calculate overall return since start
    const totalReturn = ((endNav - startNav) / startNav) * 100;

    // Calculate overall volatility
    let volatility: number | undefined;
    if (allNavs.length > 1) {
      const dailyReturns: number[] = [];
      for (let i = 1; i < allNavs.length; i++) {
        const dailyReturn = (allNavs[i] - allNavs[i - 1]) / allNavs[i - 1];
        dailyReturns.push(dailyReturn);
      }

      const meanReturn =
        dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
      const variance =
        dailyReturns.reduce(
          (sum, ret) => sum + Math.pow(ret - meanReturn, 2),
          0,
        ) / dailyReturns.length;
      volatility = Math.sqrt(variance) * 100; // Convert to percentage
    }

    return {
      fundId: fund.id,
      fundCode: fund.fundCode,
      summary: {
        periodStartNav: startNav,
        periodEndNav: endNav,
        totalReturn,
        maxNav,
        minNav,
        volatility,
        totalDays,
        // Additional performance metrics
        yesterdayPerformance,
        lastVariation,
        lastNavDate: lastValuationDate,
        ...performanceMetrics,
      },
      performance,
    };
  }

  // Helper method to calculate various performance metrics
  private calculatePerformanceMetrics(
    valuations: any[],
    endDate: Date,
    fundCreationDate: Date | null,
  ) {
    if (valuations.length === 0) return {};

    const endNav = valuations[valuations.length - 1].nav.toNumber();
    const endDateStr = endDate.toISOString().split('T')[0];

    // Calculate different time period performances
    const metrics: any = {};

    // Daily performance (last day)
    if (valuations.length >= 2) {
      const lastNav = valuations[valuations.length - 1].nav.toNumber();
      const previousNav = valuations[valuations.length - 2].nav.toNumber();
      metrics.dailyPerformance = ((lastNav - previousNav) / previousNav) * 100;
    }

    // 1 Month performance
    const oneMonthAgo = new Date(endDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthNav = this.findNavForDate(valuations, oneMonthAgo);
    if (oneMonthNav) {
      metrics.oneMonthPerformance =
        ((endNav - oneMonthNav) / oneMonthNav) * 100;
    }

    // 3 Months performance
    const threeMonthsAgo = new Date(endDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsNav = this.findNavForDate(valuations, threeMonthsAgo);
    if (threeMonthsNav) {
      metrics.threeMonthsPerformance =
        ((endNav - threeMonthsNav) / threeMonthsNav) * 100;
    }

    // 1 Year performance
    const oneYearAgo = new Date(endDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearNav = this.findNavForDate(valuations, oneYearAgo);
    if (oneYearNav) {
      metrics.oneYearPerformance = ((endNav - oneYearNav) / oneYearNav) * 100;
    }

    // 2 Years performance
    const twoYearsAgo = new Date(endDate);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsNav = this.findNavForDate(valuations, twoYearsAgo);
    if (twoYearsNav) {
      metrics.twoYearsPerformance =
        ((endNav - twoYearsNav) / twoYearsNav) * 100;
    }

    // YTD performance (Year to Date)
    const currentYear = endDate.getFullYear();
    const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
    const ytdNav = this.findNavForDate(valuations, yearStart);
    if (ytdNav) {
      metrics.ytdPerformance = ((endNav - ytdNav) / ytdNav) * 100;
    }

    // Since start performance (from fund creation)
    if (fundCreationDate && valuations.length > 0) {
      const firstNav = valuations[0].nav.toNumber();
      metrics.sinceStartPerformance = ((endNav - firstNav) / firstNav) * 100;
    }

    return metrics;
  }

  // Helper method to find NAV for a specific date (or closest previous date)
  private findNavForDate(valuations: any[], targetDate: Date): number | null {
    // Find the closest valuation date that is <= targetDate
    for (let i = valuations.length - 1; i >= 0; i--) {
      if (valuations[i].date <= targetDate) {
        return valuations[i].nav.toNumber();
      }
    }
    return null;
  }

  // Helper method to get basic performance metrics for findOne functions
  private async getFundPerformanceMetrics(fundId: string) {
    try {
      // Get all valuations for the fund
      const allValuations = await this.prisma.fundValuation.findMany({
        where: { fundId },
        orderBy: { date: 'asc' },
      });

      if (allValuations.length === 0) {
        return {
          yesterdayPerformance: undefined,
          ytdPerformance: undefined,
        };
      }

      const endNav = allValuations[allValuations.length - 1].nav.toNumber();
      const endDate = allValuations[allValuations.length - 1].date;

      // Calculate yesterday performance
      const yesterday = new Date(endDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayNav = this.findNavForDate(allValuations, yesterday);
      let yesterdayPerformance: number | undefined;
      if (yesterdayNav) {
        yesterdayPerformance = ((endNav - yesterdayNav) / yesterdayNav) * 100;
      }

      // Calculate YTD performance
      const currentYear = endDate.getFullYear();
      const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
      const ytdNav = this.findNavForDate(allValuations, yearStart);
      let ytdPerformance: number | undefined;
      if (ytdNav) {
        ytdPerformance = ((endNav - ytdNav) / ytdNav) * 100;
      }

      return {
        yesterdayPerformance,
        ytdPerformance,
      };
    } catch (error) {
      // Return undefined values if there's an error
      return {
        yesterdayPerformance: undefined,
        ytdPerformance: undefined,
      };
    }
  }
}
