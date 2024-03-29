/*
 * Copyright 2023 Nordeck IT + Consulting GmbH
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

import { getEnvironment } from '@matrix-widget-toolkit/mui';

export function getMessagingPowerLevel() {
  // this is in a function so we can mock it tests
  const raw = Number.parseInt(
    getEnvironment('REACT_APP_MESSAGING_NOT_ALLOWED_POWER_LEVEL', '100'),
  );
  return isNaN(raw) || raw < 0 ? 100 : raw;
}
