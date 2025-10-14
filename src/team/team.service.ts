import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserFilterDto } from './dto/team.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  // Get all users (Notre équipe) with pagination and filtering
  async findAll(filter?: UserFilterDto) {
    const page = filter?.page ? parseInt(filter.page, 10) : 1;
    const limit = filter?.limit ? parseInt(filter.limit, 10) : 20;

    const where: any = {
      role: {
        notIn: [UserRole.NORMAL_USER, UserRole.SUPER_ADMIN],
      },
    };

    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.department) {
      where.department = filter.department;
    }

    if (filter?.role) {
      where.role = filter.role;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          department: true,
          position: true,
          supervisor: true,
          bio: true,
          phoneNumber: true,
          profileImageUrl: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit };
  }

  // Get a user by ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        bio: true,
        status: true,
        department: true,
        position: true,
        supervisor: true,
        phoneNumber: true,
        profileImageUrl: true,
        lastLogin: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        assignedFunds: {
          include: {
            fund: {
              select: {
                id: true,
                fundCode: true,
                translations: {
                  select: {
                    name: true,
                    locale: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Get users by department
  async findByDepartment(department: string) {
    return this.prisma.user.findMany({
      where: {
        department,
        status: 'ACTIVE',
        role: {
          notIn: [UserRole.NORMAL_USER, UserRole.SUPER_ADMIN],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        bio: true,
        position: true,
        phoneNumber: true,
        profileImageUrl: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }

  // Get users by role
  async findByRole(role: string) {
    return this.prisma.user.findMany({
      where: {
        role: role as any,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        bio: true,
        position: true,
        phoneNumber: true,
        profileImageUrl: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }

  // Get team statistics
  async getTeamStats() {
    const teamRoleFilter = {
      role: {
        notIn: [UserRole.NORMAL_USER, UserRole.SUPER_ADMIN],
      },
    };

    const [totalUsers, activeUsers, usersByRole, usersByDepartment] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: teamRoleFilter }),
        this.prisma.user.count({
          where: {
            status: 'ACTIVE',
            ...teamRoleFilter,
          },
        }),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
          where: {
            status: 'ACTIVE',
            ...teamRoleFilter,
          },
          orderBy: { role: 'asc' },
        }),
        this.prisma.user.groupBy({
          by: ['department'],
          _count: { department: true },
          where: {
            status: 'ACTIVE',
            department: { not: null },
            ...teamRoleFilter,
          },
          orderBy: { department: 'asc' },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count:
          typeof item._count === 'object' && item._count
            ? item._count.role || 0
            : 0,
      })),
      usersByDepartment: usersByDepartment.map((item) => ({
        department: item.department,
        count:
          typeof item._count === 'object' && item._count
            ? item._count.department || 0
            : 0,
      })),
    };
  }
}
