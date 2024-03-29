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

import { TextFieldProps } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { Dispatch, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { longDateFormat } from './dateFormat';
import { isReduceAnimations } from './helper';

type StartDatePickerProps = {
  value: DateTime;
  onChange: Dispatch<DateTime>;
  TextFieldProps?: Partial<TextFieldProps>;

  /**
   * If set, the field is invalid and shows the text below the field.
   *
   * This setting is overridden by the `readOnly` flag.
   */
  error?: boolean | string;

  /**
   * If set, the field is readOnly and shows the text below the field.
   *
   * This setting overrides the `error` flag.
   */
  readOnly?: string;

  minDate?: DateTime;
};

export function StartDatePicker({
  value,
  error,
  readOnly,
  onChange,
  TextFieldProps,
  minDate,
}: StartDatePickerProps) {
  const { t } = useTranslation();
  const [date, setDate] = useState<DateTime>(value);

  useEffect(() => {
    setDate(value);
  }, [value]);

  const openDatePickerDialogue = useCallback(
    (date: DateTime | null) => {
      return t(
        'dateTimePickers.openStartDatePicker',
        'Choose start date, selected date is {{date, datetime}}',
        {
          date: date?.toJSDate(),
          formatParams: {
            date: longDateFormat,
          },
        },
      );
    },
    [t],
  );

  const invalidDate = !date.isValid;

  const handleOnChange = useCallback(
    (date: DateTime | null) => {
      const newValue = (date ?? DateTime.now())
        .set({ hour: value.hour, minute: value.minute })
        .startOf('minute');

      setDate(newValue);

      if (date?.isValid) {
        onChange(newValue);
      }
    },
    [onChange, value],
  );

  return (
    <DatePicker
      localeText={{ openDatePickerDialogue }}
      label={t('dateTimePickers.startDate', 'Start date')}
      minDate={minDate}
      onChange={handleOnChange}
      readOnly={Boolean(readOnly)}
      reduceAnimations={isReduceAnimations()}
      value={date}
      views={['year', 'month', 'day']}
      slotProps={{
        textField: {
          fullWidth: true,
          helperText:
            readOnly ||
            (invalidDate &&
              t('dateTimePickers.invalidStartDate', 'Invalid date')) ||
            (typeof error === 'string' ? error : undefined),
          margin: 'dense',
          ...TextFieldProps,
          error: !readOnly && (invalidDate || !!error || undefined),
        },
      }}
    />
  );
}
