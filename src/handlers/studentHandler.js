const userHandler = require("./userHandler");

module.exports = {
    chooseGroup: userHandler.handleChooseMyGroup,
    myGroup: userHandler.handleMyGroup,
    viewSchedule: userHandler.handleStudentSchedule,
    teacherSearchStart: userHandler.handleTeacherScheduleStart,
    todaySchedule: userHandler.handleTodaySchedule,
    weeklySchedule: userHandler.handleWeeklySchedule,
    help: userHandler.handleHelp,
    handleTeacherSearchText: userHandler.handleTeacherSearchText,
    handleCallback: userHandler.handleCallback
};
