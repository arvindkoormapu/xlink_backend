const { DB } = require("../../config");
const moment = require("moment");

async function insertSchedule(scheduleData) {
  console.log("scheduleData", scheduleData);
  const {
    packageid,
    starttime,
    endtime,
    interval,
    label,
    repeattype,
    repeatinterval,
    days,
  } = scheduleData;
  const query = `
        INSERT INTO schedules(packageid, starttime, endtime, interval, label, repeattype, repeatinterval, days)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8 )
        RETURNING *;
      `;
  const values = [
    packageid,
    starttime,
    endtime,
    interval,
    label,
    repeattype,
    repeatinterval,
    days,
  ];

  try {
    const res = await DB.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function insertSessionsFromSchedule(schedule, totalquantity) {
  const startHour = moment(schedule.starttime).hour();
  const startMinute = moment(schedule.starttime).minute();
  const endHour = moment(schedule.endtime).hour();
  const endMinute = moment(schedule.endtime).minute();
  const selectedDays = schedule.days.map(day => day.toLowerCase());  // Normalize days to lowercase for comparison

  let dayStartTime = moment(schedule.starttime).startOf('day');
  let dayEndTime = moment(schedule.endtime).endOf('day');

  const interval = parseInt(schedule.interval, 10); // Interval in minutes

  while (dayStartTime < dayEndTime) {
    // Adjust day start time to schedule's specific start time
    let sessionStartTime = dayStartTime.clone().set({ hour: startHour, minute: startMinute });
    // Adjust daily end time to schedule's specific end time on the same day
    let dailyEndTime = dayStartTime.clone().set({ hour: endHour, minute: endMinute });

    // Ensure we're within the overall time bounds
    if (dailyEndTime > dayEndTime) {
      dailyEndTime = moment(schedule.endtime);
    }

    // Check if the current day is one of the selected days
    if (selectedDays.includes(sessionStartTime.format('dddd').toLowerCase())) {
      while (sessionStartTime < dailyEndTime) {
        let nextTime = sessionStartTime.clone().add(interval, "minutes");

        // Check if the next slot exceeds the set daily end time
        if (nextTime > dailyEndTime) {
          break; // If it's the same day and we've reached the end time, stop creating sessions for this day
        }

        const duration = nextTime.diff(sessionStartTime, "minutes");
        const timeslot = sessionStartTime.format("YYYY-MM-DD HH:mm");
        const sessionData = {
          scheduleId: schedule.scheduleid,
          packageId: schedule.packageid,
          timeslot: timeslot,
          totalQuantity: totalquantity,
          duration: duration,
        };

        await insertSession(sessionData);
        sessionStartTime = nextTime; // Move startTime to the next slot
      }
    }

    dayStartTime.add(1, 'days'); // Move to the start of the next day
  }
}

async function insertDailySessionsFromSchedule(schedule, totalquantity) {
  let currentDay = moment(schedule.starttime);
  const endTime = moment(schedule.endtime);

  while (currentDay < endTime) {
    const timeslot = currentDay.format("YYYY-MM-DD HH:mm:ss");
    const sessionData = {
      scheduleId: schedule.scheduleid,
      packageId: schedule.packageid,
      timeslot: timeslot,
      totalQuantity: totalquantity,
      duration: schedule.interval,
    };

    await insertSession(sessionData);

    // Increment the day by repeatInterval (e.g., every 2 days)
    currentDay.add(schedule.repeatinterval, "days");
  }
}

async function insertWeeklySessionsFromSchedule(schedule, totalquantity) {
  let currentDay = moment(schedule.starttime);
  const endTime = moment(schedule.endtime);
  const selectedDays = schedule.days.map((day) => day.toLowerCase()); // Convert days to lowercase for comparison

  // Find the first relevant day that matches one of the selected days and is within the schedule range
  while (!selectedDays.includes(currentDay.format("dddd").toLowerCase())) {
    currentDay.add(1, "days");
  }

  while (currentDay <= endTime) {
    for (let day of selectedDays) {
      let sessionDay = findNextDayOfWeek(currentDay, day);
      if (sessionDay > endTime) break; // Stop if we go past the end time

      const timeslot = sessionDay.format("YYYY-MM-DD HH:mm:ss");
      const sessionData = {
        scheduleId: schedule.scheduleid,
        packageId: schedule.packageid,
        timeslot: timeslot,
        totalQuantity: totalquantity,
        duration: schedule.interval,
      };

      await insertSession(sessionData);
    }

    // Increment the week by two weeks
    currentDay.add(schedule.repeatinterval, "weeks");
  }
}

function findNextDayOfWeek(currentDay, dayOfWeek) {
  const dayOfWeekIndex = moment().day(dayOfWeek).day(); // Get the index for the given day of the week
  if (currentDay.day() <= dayOfWeekIndex) {
    return currentDay.clone().day(dayOfWeekIndex);
  } else {
    return currentDay.clone().add(1, "weeks").day(dayOfWeekIndex);
  }
}

async function insertSession(sessionData) {
  const { scheduleId, packageId, timeslot, totalQuantity, duration } =
    sessionData;
  const query = `
      INSERT INTO sessions(scheduleid, packageid, timeslot, totalquantity, duration)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *;
    `;
  const values = [scheduleId, packageId, timeslot, totalQuantity, duration];

  try {
    const res = await DB.query(query, values);
    console.log(res.rows[0]);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const create = async (
  label,
  totalquantity,
  starttime,
  endtime,
  interval,
  packageid,
  repeattype,
  repeatinterval,
  days
) => {
  const data = {
    label,
    totalquantity,
    starttime,
    endtime,
    interval,
    packageid,
    repeattype,
    repeatinterval,
    days,
  };

  try {
    const schedule = await insertSchedule(data);
    if (repeattype === "hourly") {
      await insertSessionsFromSchedule(schedule, totalquantity);
    } else if (repeattype === "daily") {
      await insertDailySessionsFromSchedule(schedule, totalquantity);
    } else if (repeattype === "weekly") {
      await insertWeeklySessionsFromSchedule(schedule, totalquantity);
    }
    return
  } catch (err) {
    console.error(err);
  }
};

const get = async (id) => {
  const result = await DB.query(
    `SELECT DISTINCT ON (schedules.scheduleid) schedules.*, sessions.totalquantity
     FROM schedules
     JOIN sessions ON schedules.scheduleid = sessions.scheduleid
     WHERE schedules.packageid = $1
     ORDER BY schedules.scheduleid`,
    [id]
  );
  return result.rows;
};

const deleteSession = async (scheduleid) => {
  const client = await DB.connect();

  try {
    await client.query('BEGIN');

    // Delete from sessions
    const deleteSessionsQuery = `
      DELETE FROM sessions
      WHERE scheduleid = $1;
    `;
    await client.query(deleteSessionsQuery, [scheduleid]);

    // Delete from schedules
    const deleteSchedulesQuery = `
      DELETE FROM schedules
      WHERE scheduleid = $1;
    `;
    await client.query(deleteSchedulesQuery, [scheduleid]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

module.exports = {
  create,
  get,
  deleteSession
};
