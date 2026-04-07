"use server";

import { DateRange } from "react-day-picker";

import { connectToDatabase } from "@/lib/db";
import WebAnalyticsEvent from "@/lib/db/models/web-analytics-event.model";
import { getServerSession } from "@/lib/get-session";

function buildRangeFilter(range?: DateRange) {
  const now = new Date();
  const to = range?.to ?? now;
  const from = range?.from ?? new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  return {
    from,
    to,
    createdAt: {
      $gte: from,
      $lte: to,
    },
  };
}

export async function getWebAnalyticsSummary(range?: DateRange) {
  await connectToDatabase();
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const { from, to, createdAt } = buildRangeFilter(range);

  const [totals, pageViewsByDay, topPages, topReferrers, topCountries, topDevices, topBrowsers] =
    await Promise.all([
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        {
          $group: {
            _id: null,
            pageViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
            uniqueSessions: { $addToSet: "$sessionId" },
          },
        },
        {
          $project: {
            _id: 0,
            pageViews: 1,
            visitors: { $size: "$uniqueVisitors" },
            sessions: { $size: "$uniqueSessions" },
          },
        },
      ]),
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            pageViews: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            pageViews: 1,
            visitors: { $size: "$visitors" },
          },
        },
        { $sort: { date: 1 } },
      ]),
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        { $group: { _id: "$path", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
        {
          $project: {
            _id: 0,
            path: "$_id",
            views: 1,
            visitors: { $size: "$visitors" },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        {
          $group: {
            _id: { $ifNull: ["$referrerHost", "Direct"] },
            views: { $sum: 1 },
          },
        },
        { $project: { _id: 0, source: "$_id", views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        { $group: { _id: { $ifNull: ["$country", "Unknown"] }, views: { $sum: 1 } } },
        { $project: { _id: 0, country: "$_id", views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        { $group: { _id: "$deviceType", views: { $sum: 1 } } },
        { $project: { _id: 0, name: "$_id", views: 1 } },
        { $sort: { views: -1 } },
      ]),
      WebAnalyticsEvent.aggregate([
        { $match: { createdAt } },
        { $group: { _id: "$browser", views: { $sum: 1 } } },
        { $project: { _id: 0, name: "$_id", views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ]),
    ]);

  const totalsDoc = totals[0] ?? { pageViews: 0, visitors: 0, sessions: 0 };

  const sessionStats = await WebAnalyticsEvent.aggregate([
    { $match: { createdAt } },
    {
      $group: {
        _id: "$sessionId",
        firstSeen: { $min: "$createdAt" },
        lastSeen: { $max: "$createdAt" },
        pageViews: { $sum: 1 },
      },
    },
    {
      $project: {
        durationSeconds: {
          $divide: [{ $subtract: ["$lastSeen", "$firstSeen"] }, 1000],
        },
        pageViews: 1,
      },
    },
  ]);

  const bounceSessions = sessionStats.filter((session) => session.pageViews <= 1).length;
  const avgDurationSeconds =
    sessionStats.length > 0
      ? Math.round(
          sessionStats.reduce((sum, item) => sum + (item.durationSeconds || 0), 0) /
            sessionStats.length
        )
      : 0;

  const realtimeVisitors = await WebAnalyticsEvent.distinct("visitorId", {
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
  });

  return {
    range: { from, to },
    totals: {
      pageViews: totalsDoc.pageViews,
      visitors: totalsDoc.visitors,
      sessions: totalsDoc.sessions,
      bounceRate: totalsDoc.sessions ? Math.round((bounceSessions / totalsDoc.sessions) * 1000) / 10 : 0,
      avgDurationSeconds,
      realtimeVisitors: realtimeVisitors.length,
    },
    pageViewsByDay: JSON.parse(JSON.stringify(pageViewsByDay)),
    topPages: JSON.parse(JSON.stringify(topPages)),
    topReferrers: JSON.parse(JSON.stringify(topReferrers)),
    topCountries: JSON.parse(JSON.stringify(topCountries)),
    topDevices: JSON.parse(JSON.stringify(topDevices)),
    topBrowsers: JSON.parse(JSON.stringify(topBrowsers)),
  };
}
