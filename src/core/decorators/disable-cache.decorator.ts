import { SetMetadata } from '@nestjs/common';

export const DisableCache = () => SetMetadata('disableCache', true);
