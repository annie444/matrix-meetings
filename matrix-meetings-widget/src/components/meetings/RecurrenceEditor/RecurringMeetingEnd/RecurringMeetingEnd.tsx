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
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import { unstable_useId as useId } from '@mui/utils';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { ChangeEvent, Dispatch, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { longDateFormat } from '../../../common/DateTimePickers';
import { RecurrenceEnd } from '../state';

type RecurringMeetingEndProps = {
  startDate: Date;
  afterMeetingCount: string;
  onAfterMeetingCountChange: Dispatch<string>;
  recurrenceEnd: RecurrenceEnd;
  onRecurrenceEndChange: Dispatch<RecurrenceEnd>;
  untilDate: DateTime;
  onUntilDateChange: Dispatch<DateTime>;
  disabled?: boolean;
};

export const RecurringMeetingEnd = ({
  startDate,
  afterMeetingCount,
  onAfterMeetingCountChange,
  recurrenceEnd,
  onRecurrenceEndChange,
  untilDate,
  onUntilDateChange,
  disabled,
}: RecurringMeetingEndProps) => {
  const { t } = useTranslation();
  const afterMeetingCountParsed = parseInt(afterMeetingCount);
  const isAfterMeetingCountInvalid =
    isNaN(afterMeetingCountParsed) || afterMeetingCountParsed < 1;

  const handleAfterMeetingCountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onAfterMeetingCountChange(e.target.value);
    },
    [onAfterMeetingCountChange],
  );

  const handleRecurrenceEndChange = useCallback(
    (e: SelectChangeEvent<RecurrenceEnd>) => {
      onRecurrenceEndChange(e.target.value as RecurrenceEnd);
    },
    [onRecurrenceEndChange],
  );

  const handleUntilDateChange = useCallback(
    (value: DateTime | null) => {
      onUntilDateChange((value ?? DateTime.now()).endOf('day'));
    },
    [onUntilDateChange],
  );

  const openDatePickerDialogue = useCallback(
    (date: DateTime | null) => {
      return t(
        'recurrenceEditor.recurringMeetingEnd.untilDateInputOpenDatePicker',
        'Choose date at which the recurring meeting ends, selected date is {{date, datetime}}',
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

  const radioGroupLabelId = useId();
  const untilDateRadioId = useId();
  const afterMeetingCountRadioId = useId();

  return (
    <FormControl
      component="fieldset"
      margin="dense"
      sx={{ mt: 0, display: 'block' }}
    >
      <FormLabel component="legend" id={radioGroupLabelId}>
        {t(
          'recurrenceEditor.recurringMeetingEnd.endOfRecurringMeeting',
          'End of the recurring meeting',
        )}
      </FormLabel>
      <RadioGroup
        aria-labelledby={radioGroupLabelId}
        name="recurrenceEnd"
        onChange={handleRecurrenceEndChange}
        value={recurrenceEnd}
      >
        <FormControlLabel
          disabled={disabled}
          control={
            <Radio
              inputProps={{
                'aria-label': t(
                  'recurrenceEditor.recurringMeetingEnd.neverLong',
                  'The meeting is repeated forever',
                ),
              }}
            />
          }
          label={
            // Make sure that the label text is NOT read by the screen reader,
            // instead we read the aria-label above
            <span aria-hidden>
              {t('recurrenceEditor.recurringMeetingEnd.never', 'Never')}
            </span>
          }
          value={RecurrenceEnd.Never}
        />

        <Stack direction="row" flexWrap="wrap">
          <FormControlLabel
            disabled={disabled}
            control={
              <Radio
                id={untilDateRadioId}
                inputProps={{
                  'aria-label': t(
                    'recurrenceEditor.recurringMeetingEnd.untilDateLong',
                    'The meeting is repeated till {{date,datetime}}',
                    {
                      date: untilDate.toJSDate(),
                      formatParams: {
                        date: longDateFormat,
                      },
                    },
                  ),
                }}
              />
            }
            label={
              // Make sure that the label text is NOT read by the screen reader,
              // instead we read the aria-label above
              <span aria-hidden>
                {t('recurrenceEditor.recurringMeetingEnd.untilDate', 'On')}
              </span>
            }
            value={RecurrenceEnd.UntilDate}
          />

          {/* div is placed here to avoid full width */}
          <Box
            alignItems="baseline"
            aria-labelledby={untilDateRadioId}
            role="group"
          >
            <DatePicker
              disabled={recurrenceEnd !== RecurrenceEnd.UntilDate || disabled}
              localeText={{ openDatePickerDialogue }}
              minDate={DateTime.fromJSDate(startDate)}
              onChange={handleUntilDateChange}
              value={untilDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: !untilDate.isValid
                    ? t(
                        'recurrenceEditor.recurringMeetingEnd.untilDateInputInvalid',
                        'Invalid date',
                      )
                    : undefined,
                  margin: 'dense',
                  inputProps: {
                    'aria-label': t(
                      'recurrenceEditor.recurringMeetingEnd.untilDateInput',
                      'Date at which the recurring meetings ends',
                    ),
                  },
                },
              }}
            />
          </Box>
        </Stack>

        <Stack direction="row" flexWrap="wrap">
          <FormControlLabel
            disabled={disabled}
            control={
              <Radio
                id={afterMeetingCountRadioId}
                inputProps={{
                  'aria-label': t(
                    'recurrenceEditor.recurringMeetingEnd.afterMeetingCountLong',
                    'Ends after {{count}} meetings',
                    { count: parseInt(afterMeetingCount) },
                  ),
                }}
              />
            }
            label={
              // Make sure that the label text is NOT read by the screen reader,
              // instead we read the aria-label above
              <span aria-hidden>
                {t(
                  'recurrenceEditor.recurringMeetingEnd.afterMeetingCount',
                  'After',
                )}
              </span>
            }
            value={RecurrenceEnd.AfterMeetingCount}
          />
          <Box
            alignItems="baseline"
            aria-labelledby={afterMeetingCountRadioId}
            role="group"
          >
            <TextField
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {t(
                      'recurrenceEditor.recurringMeetingEnd.afterMeetingCountInputUnit',
                      'Meetings',
                    )}
                  </InputAdornment>
                ),
              }}
              disabled={
                recurrenceEnd !== RecurrenceEnd.AfterMeetingCount || disabled
              }
              error={isAfterMeetingCountInvalid}
              helperText={
                isAfterMeetingCountInvalid &&
                t(
                  'recurrenceEditor.recurringMeetingEnd.invalidInput',
                  'Invalid input',
                )
              }
              inputProps={{
                inputMode: 'numeric',
                type: 'number',
                min: 1,
                // Setting a max value gives restricts the width of the input
                max: 9999,
                'aria-label': t(
                  'recurrenceEditor.recurringMeetingEnd.afterMeetingCountInput',
                  'Count of meetings',
                ),
              }}
              onChange={handleAfterMeetingCountChange}
              value={afterMeetingCount}
            />
          </Box>
        </Stack>
      </RadioGroup>
    </FormControl>
  );
};
