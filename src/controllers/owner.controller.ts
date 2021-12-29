import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
@Controller(CONTROLLER_CONSTANTS.OWNER)
@ApiTags(CONTROLLER_CONSTANTS.OWNER)
export class OwnerController {
  constructor() {}

  @Get(':address​/safes​/')
  @ApiOperation({
    summary: 'Return Safes where the address provided is an owner',
  })
  async getSafes(@Param('address') address: string) {
    return `Return Safes where the address: ${address} is an owner `;
  }
}
