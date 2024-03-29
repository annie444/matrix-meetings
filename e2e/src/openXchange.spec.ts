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

import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('OpenXchange', () => {
  test('should create meeting via OX', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    aliceJitsiWidgetPage,
    aliceCockpitWidgetPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
    });

    await alicePage.goto(meetingUrl);

    const inviteReasonText = await aliceElementWebPage.revealRoomInviteReason();
    await expect(inviteReasonText).toContainText(
      '📅 10/3/2040, 10:30 – 11:00 AM GMT+2',
    );
    await expect(inviteReasonText).toContainText('My Description');
    await aliceElementWebPage.acceptRoomInvitation();

    await expect(aliceElementWebPage.roomNameText).toHaveText('My Meeting');
    await expect(aliceElementWebPage.roomTopicText).toHaveText(
      'My Description',
    );
    await expect(aliceJitsiWidgetPage.joinConferenceButton).toBeVisible();

    await aliceElementWebPage.showWidgetInSidebar('NeoDateFix Details');

    const meetingDetails = aliceCockpitWidgetPage.getMeeting();
    await aliceElementWebPage.approveWidgetIdentity();

    await expect(meetingDetails.meetingTitleText).toHaveText('My Meeting');
    await expect(meetingDetails.meetingDescriptionText).toHaveText(
      'My Description',
    );
    await expect(meetingDetails.meetingTimeRangeText).toHaveText(
      'October 3, 2040, 10:30 – 11:00 AM',
    );

    await expect(meetingDetails.editInOpenXchangeMenuItem).toHaveAttribute(
      'href',
      'https://webmail-hostname/appsuite/#app=io.ox/calendar&id=meeting-id&folder=cal://0/471',
    );
    await expect(meetingDetails.deleteInOpenXchangeMenuItem).toHaveAttribute(
      'href',
      'https://webmail-hostname/appsuite/#app=io.ox/calendar&id=meeting-id&folder=cal://0/471',
    );

    expect(await aliceElementWebPage.getWidgets()).toEqual([
      'Breakout Sessions',
      'NeoDateFix Details',
      'Video Conference',
    ]);
  });

  test('should create recurring meeting via OX', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    aliceCockpitWidgetPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
      externalDataOxRrules: ['FREQ=DAILY;COUNT=5'],
    });

    await alicePage.goto(meetingUrl);

    await aliceElementWebPage.acceptRoomInvitation();

    await aliceElementWebPage.showWidgetInSidebar('NeoDateFix Details');

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingTimeRangeText,
    ).toHaveText('October 3, 2040, 10:30 – 11:00 AM');
    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingRecurrenceRuleText,
    ).toHaveText('Every day for 5 times');
  });

  test('should update meeting via OX', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    aliceCockpitWidgetPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl, roomId } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
    });

    await alicePage.goto(meetingUrl);
    await aliceElementWebPage.acceptRoomInvitation();

    await aliceElementWebPage.showWidgetInSidebar('NeoDateFix Details');

    const meetingDetails = aliceCockpitWidgetPage.getMeeting();
    await expect(meetingDetails.meetingTimeRangeText).toHaveText(
      'October 3, 2040, 10:30 – 11:00 AM',
    );

    await meetingsBotApi.updateMeeting({
      roomId,
      startTime: '2040-10-04T10:30:00.000+02:00',
      endTime: '2040-10-04T11:00:00.000+02:00',
      title: 'My Meeting',
      description: 'My Description',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
    });

    await aliceElementWebPage.approveWidgetIdentity();

    await expect(
      aliceElementWebPage.locateChatMessageInRoom(
        /October 4, 2040, 10:30\s–\s11:00\sAM GMT\+2/,
      ),
    ).toBeVisible();
    await expect(
      aliceElementWebPage.locateChatMessageInRoom(
        /\(previously: October 3, 2040, 10:30\s–\s11:00\sAM GMT\+2\)/,
      ),
    ).toBeVisible();

    await expect(meetingDetails.meetingTimeRangeText).toHaveText(
      'October 4, 2040, 10:30 – 11:00 AM',
    );
  });

  test('should update meeting via OX and update invitation state', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl, roomId } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
    });

    await alicePage.goto(meetingUrl);

    const inviteReasonText = await aliceElementWebPage.revealRoomInviteReason();
    await expect(inviteReasonText).toContainText(
      '📅 10/3/2040, 10:30 – 11:00 AM GMT+2',
    );
    await expect(inviteReasonText).toContainText('My Description');
    await expect(aliceElementWebPage.roomInviteHeader).toHaveText(
      'Do you want to join My Meeting?',
    );

    await meetingsBotApi.updateMeeting({
      roomId,
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      title: 'My new Meeting',
      description: 'My new Description',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
    });

    await expect(inviteReasonText).toContainText('My new Description');
    await expect(aliceElementWebPage.roomInviteHeader).toHaveText(
      /My new Meeting/,
    );
  });

  test('should convert a recurring OX meeting into a single meeting', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    aliceCockpitWidgetPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl, roomId } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
      externalDataOxRrules: ['FREQ=DAILY;COUNT=5'],
    });

    await alicePage.goto(meetingUrl);

    await aliceElementWebPage.acceptRoomInvitation();

    await aliceElementWebPage.showWidgetInSidebar('NeoDateFix Details');

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingTimeRangeText,
    ).toHaveText('October 3, 2040, 10:30 – 11:00 AM');

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingRecurrenceRuleText,
    ).toHaveText(' Every day for 5 times');

    await meetingsBotApi.updateMeeting({
      roomId,
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      title: 'My Meeting',
      description: 'My Description',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
    });

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingTimeRangeText,
    ).toHaveText('October 3, 2040, 10:30 – 11:00 AM');

    await aliceElementWebPage.approveWidgetIdentity();

    await expect(
      aliceElementWebPage.locateChatMessageInRoom(
        /Repeat meeting: No repetition/,
      ),
    ).toBeVisible();

    await expect(
      aliceElementWebPage.locateChatMessageInRoom(
        /\(previously: Every day for 5 times\)/,
      ),
    ).toBeVisible();
  });

  test('should convert a single OX meeting into a recurring meeting', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    aliceCockpitWidgetPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl, roomId } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
    });

    await alicePage.goto(meetingUrl);

    await aliceElementWebPage.acceptRoomInvitation();

    await aliceElementWebPage.showWidgetInSidebar('NeoDateFix Details');

    await aliceElementWebPage.approveWidgetIdentity();

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingTimeRangeText,
    ).toHaveText('October 3, 2040, 10:30 – 11:00 AM');

    await meetingsBotApi.updateMeeting({
      roomId,
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      title: 'My Meeting',
      description: 'My Description',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      externalDataOxRrules: ['FREQ=DAILY;COUNT=5'],
    });

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingTimeRangeText,
    ).toHaveText('October 3, 2040, 10:30 – 11:00 AM');

    await expect(
      aliceCockpitWidgetPage.getMeeting().meetingRecurrenceRuleText,
    ).toHaveText('Every day for 5 times');

    await expect(
      aliceElementWebPage.locateChatMessageInRoom(
        /Repeat meeting: Every day for 5 times/,
      ),
    ).toBeVisible();

    await expect(
      aliceElementWebPage.locateChatMessageInRoom(
        /\(previously: No repetition\)/,
      ),
    ).toBeVisible();
  });

  test('should delete meeting via OX with tombstone', async ({
    alice,
    aliceElementWebPage,
    aliceJitsiWidgetPage,
    aliceMeetingsWidgetPage,
    meetingsBotApi,
  }) => {
    const parentRoomId = aliceElementWebPage.getCurrentRoomId();
    const { roomId } = await meetingsBotApi.createMeeting({
      parentRoomId,
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
    });

    await aliceMeetingsWidgetPage.setDateFilter([2040, 10, 1], [2040, 10, 8]);

    await expect(
      aliceMeetingsWidgetPage.getMeeting('My Meeting', '10/03/2040')
        .meetingTimeRangeText,
    ).toHaveText('10:30 AM – 11:00 AM');

    await aliceElementWebPage.switchToRoom('My Meeting');

    await expect(aliceJitsiWidgetPage.joinConferenceButton).toBeVisible();

    await meetingsBotApi.deleteMeeting({
      roomId,
      method: 'tombstone',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
    });

    await expect(aliceElementWebPage.locateTombstone()).toBeVisible();
  });

  test('should delete meeting via OX with kick_all_participants', async ({
    alice,
    alicePage,
    aliceElementWebPage,
    meetingsBotApi,
  }) => {
    const { meetingUrl, roomId } = await meetingsBotApi.createMeeting({
      title: 'My Meeting',
      description: 'My Description',
      startTime: '2040-10-03T10:30:00.000+02:00',
      endTime: '2040-10-03T11:00:00.000+02:00',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
      participants: [alice.username],
    });

    await alicePage.goto(meetingUrl);
    await aliceElementWebPage.acceptRoomInvitation();

    await meetingsBotApi.deleteMeeting({
      roomId,
      method: 'kick_all_participants',
      openIdToken: await aliceElementWebPage.getOpenIdToken(),
    });

    await expect(aliceElementWebPage.userKickMessageHeader).toBeVisible();
  });
});
