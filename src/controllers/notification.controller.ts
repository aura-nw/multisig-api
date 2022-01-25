import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
@Controller(CONTROLLER_CONSTANTS.NOTIFICATION)
@ApiTags(CONTROLLER_CONSTANTS.NOTIFICATION)
export class NotificationController {
  constructor() {}

  // @Post('devices')
  // @ApiOperation({ summary: 'Creates a new FirebaseDevice' })
  // async createDevice() {
  //   return `Creates a new FirebaseDevice`;
  // }

  // @Delete('devices/:uuid')
  // @ApiOperation({ summary: 'Remove a FirebaseDevice' })
  // async removeDevice() {
  //   return `Remove a FirebaseDevice`;
  // }

  // @Delete('devices/:uuid/safes/:address}')
  // @ApiOperation({ summary: 'Remove a Safe for a FirebaseDevice' })
  // async removeSafeForDevice() {
  //   return `Remove a Safe for a FirebaseDevice`;
  // }
}
