/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { DeepReadonly } from '../DeepReadOnly';
import { ModuleProviderToken } from '../ModuleProviderToken';
import { IRoomMatrixEvents } from '../model/IRoomMatrixEvents';

@ValidatorConstraint({ async: false })
@Injectable()
export class DoesWidgetWithIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @Inject(ModuleProviderToken.ROOM_MATRIX_EVENTS)
    private roomMatrixEvents: DeepReadonly<IRoomMatrixEvents>,
  ) {}

  validate(value: any) {
    return this.roomMatrixEvents.allWidgetIds.includes(value);
  }

  defaultMessage() {
    return '$property should contain existing widget ids';
  }
}

export function DoesWidgetWithIdExist(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: DoesWidgetWithIdExistConstraint,
    });
  };
}
