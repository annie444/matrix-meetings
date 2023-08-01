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

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import * as moment from 'moment-timezone';
import { ComponentType, PropsWithChildren } from 'react';
import { LocalizationProvider } from '../LocalizationProvider';
import { EndDatePicker } from './EndDatePicker';

describe('<EndDatePicker/>', () => {
  const onChange = jest.fn();
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: PropsWithChildren<{}>) => {
      return <LocalizationProvider>{children}</LocalizationProvider>;
    };
  });

  it('should render without exploding', () => {
    render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38Z')}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('textbox', { name: /end date/i })).toHaveValue(
      '01/01/2020'
    );
    expect(
      screen.getByRole('button', {
        name: 'Choose end date, selected date is January 1, 2020',
      })
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38Z')}
      />,
      { wrapper: Wrapper }
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no accessibility violations, if picker is open', async () => {
    const { container } = render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38Z')}
      />,
      { wrapper: Wrapper }
    );

    await userEvent.click(
      screen.getByLabelText(
        /choose end date, selected date is January 1, 2020/i
      )
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should update the meeting end date', () => {
    render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38.123Z')}
      />,
      { wrapper: Wrapper }
    );

    // userEvent.type doesn't work here, so we have to use fireEvent
    fireEvent.change(screen.getByRole('textbox', { name: /end date/i }), {
      target: { value: '06/05/2022' },
    });

    expect(onChange).toBeCalled();
    expect(onChange.mock.calls[0][0].toISOString()).toEqual(
      '2022-06-05T12:15:00.000Z'
    );
  });

  it('should not update on invalid value', () => {
    render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38.123Z')}
      />,
      { wrapper: Wrapper }
    );

    const textbox = screen.getByRole('textbox', { name: /end date/i });

    // userEvent.type doesn't work here, so we have to use fireEvent
    fireEvent.change(textbox, { target: { value: '99/99/9999' } });

    expect(textbox).not.toHaveAccessibleDescription('Invalid date');
    expect(textbox).toBeValid();

    expect(onChange).not.toBeCalled();
  });

  it('should show error state', () => {
    render(
      <EndDatePicker
        error="This is wrong"
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38Z')}
      />,
      { wrapper: Wrapper }
    );

    const input = screen.getByRole('textbox', { name: /end date/i });

    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('This is wrong');
  });

  it('should notice an external data update', () => {
    const { rerender } = render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38.123Z')}
      />,
      { wrapper: Wrapper }
    );

    const input = screen.getByRole('textbox', { name: /end date/i });

    expect(input).toHaveValue('01/01/2020');

    rerender(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2021-01-01T12:15:38.123Z')}
      />
    );

    expect(input).toHaveValue('01/01/2021');
  });

  it('disallow values in the past by default', () => {
    render(
      <EndDatePicker
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38.123Z')}
      />,
      { wrapper: Wrapper }
    );

    const input = screen.getByRole('textbox', { name: /end date/i });
    expect(input).toBeInvalid();
  });

  it('allow values in the past', () => {
    render(
      <EndDatePicker
        enablePast
        onChange={onChange}
        value={moment.utc('2020-01-01T12:15:38.123Z')}
      />,
      { wrapper: Wrapper }
    );

    const input = screen.getByRole('textbox', { name: /end date/i });
    expect(input).toBeValid();
  });
});
