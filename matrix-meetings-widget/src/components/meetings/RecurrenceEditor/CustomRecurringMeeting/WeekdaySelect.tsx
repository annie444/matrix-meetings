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

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { unstable_useId as useId, visuallyHidden } from '@mui/utils';
import { Dispatch, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { localeWeekdays } from '../../../../lib/utils';
import { convertWeekdayFromLocaleToRRule } from '../utils';

export type WeekdaySelectProps = {
  disabled?: boolean;
  onWeekdayChange: Dispatch<number>;
  weekday: number;
};

export const WeekdaySelect = ({
  disabled,
  onWeekdayChange,
  weekday,
}: WeekdaySelectProps) => {
  const { t } = useTranslation();

  const handleWeekDaysChange = useCallback(
    (e: SelectChangeEvent<number>) => {
      onWeekdayChange(e.target.value as number);
    },
    [onWeekdayChange],
  );

  const labelId = useId();
  const selectId = useId();

  return (
    <FormControl disabled={disabled} margin="dense">
      <InputLabel id={labelId} sx={visuallyHidden}>
        {t('recurrenceEditor.weekdayLabel', 'Weekday')}
      </InputLabel>

      <Select
        id={selectId}
        labelId={labelId}
        onChange={handleWeekDaysChange}
        value={weekday}
      >
        {localeWeekdays().map((m, i) => (
          <MenuItem key={i} value={convertWeekdayFromLocaleToRRule(i)}>
            {m}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
