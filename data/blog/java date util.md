---
title: Java date工具类
date: '2021-12-08'
tags: ['java']
draft: false
summary: Java date工具类
---
# Java Date Util

```java
package spikeUtils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class DateUtils {
	/**
	 * 日期加一天
	 * @param date
	 * @param day
	 * @return
	 */

	public  static   Date  addDay(Date  date,Integer day){
        if(date==null){ date=new Date(); }
        Calendar  calendar=Calendar.getInstance();
        calendar.setTime(date);
        try {
            calendar.add(Calendar.DAY_OF_MONTH,day);
        }catch (Exception e){
            calendar.add(Calendar.DAY_OF_MONTH,0);
        }
        return  calendar.getTime();
    }
	/**
	 * 将分钟、秒、毫秒域清零
	 * @param date
	 * @return
	 */
	public  static Date  clearHourMinSec(Date  date){
		 Calendar cal1 = Calendar.getInstance();
	        cal1.setTime(date);
	        cal1.set(Calendar.HOUR_OF_DAY, 0);
	        cal1.set(Calendar.MINUTE, 0);
	        cal1.set(Calendar.SECOND, 0);
	        cal1.set(Calendar.MILLISECOND, 0);
	        Date dateReset = cal1.getTime();
			return dateReset;
    }


	/**
	 * 时间比较, 比较到日
	 * @param date1 时间1
	 * @param date2 时间2
	 * @return 0表示相同, 正数是date1 > date2, 负数是date1 < date2
	 */
	public static int compareToDay(Date date1, Date date2) {
		if (date1 == null || date2 == null) {
			return 0;
		}
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		return sdf.format(date1).compareTo(sdf.format(date2));
	}
	/**
	 * 时间比较, 比较到秒
	 * @param date1 时间1
	 * @param date2 时间2
	 * @return 0表示相同, 正数是date1 > date2, 负数是date1 < date2
	 */
	public static int compareToSecond(Date date1, Date date2) {
		if (date1 == null || date2 == null) {
			return 0;
		}
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		return sdf.format(date1).compareTo(sdf.format(date2));
	}
	/**
	 * 取得所给的日期的日开始时间(00:00:00,000)
	 * @param day 要转换的日期
	 * @return 日开始时间
	 */
	public static Date getStartDateOfDay(Date day) {
		if (day == null) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(day);
		cal.set(Calendar.MILLISECOND, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		return cal.getTime();
	}
	/**
	 * 取得所给的日期的日结束时间(23:59:59,000)
	 * @param day 要转换的日期
	 * @return 日结束时间
	 */
	public static Date getEndDateOfDay(Date day) {
		if (day == null) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(day);
		cal.set(Calendar.MILLISECOND, 0);
		cal.set(Calendar.SECOND, 59);
		cal.set(Calendar.MINUTE, 59);
		cal.set(Calendar.HOUR_OF_DAY, 23);
		return cal.getTime();
	}
	/**
	 * 取得所给的日期的月开始时间(00:00:00,000)
	 * @param day 要转换的日期
	 * @return 月开始时间
	 */
	public static Date getStartDateOfMonth(Date day) {
		if (day == null) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(day);
		cal.set(Calendar.MILLISECOND, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.DAY_OF_MONTH, 1);
		return cal.getTime();
	}
	/**
	 * 取得所给的日期的月结束时间(23:59:59,000)
	 * @param day 要转换的日期
	 * @return 月结束时间
	 */
	public static Date getEndDateOfMonth(Date day) {
		if (day == null) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(day);
		cal.set(Calendar.MILLISECOND, 0);
		cal.set(Calendar.SECOND, 59);
		cal.set(Calendar.MINUTE, 59);
		cal.set(Calendar.HOUR_OF_DAY, 23);
		cal.set(Calendar.DAY_OF_MONTH, 1);
		cal.add(Calendar.MONTH, 1);
		cal.add(Calendar.DAY_OF_MONTH, -1);
		return cal.getTime();
	}
	/**
	 * 取得所给的日期的年开始时间(00:00:00,000)
	 * @param day 要转换的日期
	 * @return 年开始时间
	 */
	public static Date getStartDateOfYear(Date day) {
		if (day == null) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(day);
		cal.set(Calendar.MILLISECOND, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.DAY_OF_MONTH, 1);
		cal.set(Calendar.MONTH, 0);
		return cal.getTime();
	}
	/**
	 * 取得所给的日期的年结束时间(23:59:59,000)
	 * @param day 要转换的日期
	 * @return 年结束时间
	 */
	public static Date getEndDateOfYear(Date day) {
		if (day == null) {
			return null;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(day);
		cal.set(Calendar.MILLISECOND, 0);
		cal.set(Calendar.SECOND, 59);
		cal.set(Calendar.MINUTE, 59);
		cal.set(Calendar.HOUR_OF_DAY, 23);
		cal.set(Calendar.DAY_OF_MONTH, 1);
		cal.set(Calendar.MONTH, 0);
		cal.add(Calendar.YEAR, 1);
		cal.add(Calendar.DAY_OF_YEAR, -1);
		return cal.getTime();
	}
	/**
	 * 根据年月日创建的日期
	 * @param year 年 如2006年为2006
	 * @param month 月 如12月为 11
	 * @param day 日 如15日为15
	 * @return 日期
	 */
	public static Date getDate(int year, int month, int day) {
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.YEAR, year);
		cal.set(Calendar.MONTH, month);
		cal.set(Calendar.DAY_OF_MONTH, day);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		return cal.getTime();
	}
	/**
	 * 根据年月日创建的日期
	 * @param year 年 如2006年为2006
	 * @param month 月 如12月为 11
	 * @param day 日 如15日为15
	 * @param hour 小时 24时格式 如下午2点为 14
	 * @param minute 分钟 如25分为25
	 * @param second 秒 如30秒位30
	 * @return 日期
	 */
	public static Date getDate(int year, int month, int day, int hour, int minute, int second) {
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.YEAR, year);
		cal.set(Calendar.MONTH, month);
		cal.set(Calendar.DAY_OF_MONTH, day);
		cal.set(Calendar.HOUR_OF_DAY, hour);
		cal.set(Calendar.MINUTE, minute);
		cal.set(Calendar.SECOND, second);
		cal.set(Calendar.MILLISECOND, 0);
		return cal.getTime();
	}
	/**
	 * 取得年数字
	 * @param date 日期
	 * @return 年数字
	 */
	public static int getYear(Date date) {
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		return cal.get(Calendar.YEAR);
	}
	/**
	 * 取得月数字,一月为 0
	 * @param date 日期
	 * @return 月数字
	 */
	public static int getMonth(Date date) {
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		return cal.get(Calendar.MONTH);
	}
	/**
	 * 取得日数字
	 * @param date 日期
	 * @return 日数字
	 */
	public static int getDay(Date date) {
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		return cal.get(Calendar.DAY_OF_MONTH);
	}
	/**
	 * 计算开始日期和结束日期中间相差几个月
	 * @param start 开始日期
	 * @param end 结束日期
	 * @return 相差几个月
	 */
	public static int calculateMonthDistance(Date start, Date end) {
		int year1 = DateUtils.getYear(start);
		int year2 = DateUtils.getYear(end);
		int month1 = DateUtils.getMonth(start);
		int month2 = DateUtils.getMonth(end);
		return 12 * (year1 - year2) + (month1 - month2);
	}
	/**
	 * 计算开始日期和结束日期中间相差多少天
	 * @param start 开始日期
	 * @param end 结束日期
	 * @return 相差多少天
	 */
	public static int calculateDayDistance(Date start, Date end) {
		long startTimeInMillis = start.getTime();
		long endTimeInMillis = end.getTime();
		return (int) ((startTimeInMillis - endTimeInMillis) / (1000 * 60 * 60 * 24));
	}
	/**
	 * 得到现在的时间
	 * @return Date
	 */
	public static Date now() {
		return Calendar.getInstance().getTime();
	}
	/**
	 * 得到现在的时间, 以秒的形式
	 * @return long
	 */
	public static long nowInMillis() {
		return Calendar.getInstance().getTimeInMillis();
	}
	/**
	 * 当前时间以指定格式传换成文字.
	 * @param pattern 格式
	 * @return 文字
	 */
	public static String nowInFormat(String pattern) {
		SimpleDateFormat sdf = new SimpleDateFormat(pattern);
		return sdf.format(Calendar.getInstance().getTime());
	}
	/**
	 * 字符串转换到时间格式
	 * @param dateStr 需要转换的字符串
	 * @param formatStr 需要格式的目标字符串 举例 yyyy-MM-dd
	 * @return Date 返回转换后的时间
	 * @throws ParseException 转换异常
	 */
	public static Date StringToDate(String dateStr) throws ParseException {
		DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date date = null;
		if (null != dateStr && !"".equals(dateStr)) {
			date = sdf.parse(dateStr);
		}
		return date;
	}
	/**
	 * 字符串转换到时间格式
	 * @param dateStr 需要转换的字符串
	 * @param formatStr 需要格式的目标字符串 举例 yyyy-MM
	 * @return Date 返回转换后的时间
	 * @throws ParseException 转换异常
	 */
	public static Date StringToDateFormat(String dateStr) {
		DateFormat sdf = new SimpleDateFormat("yyyy-MM");
		Date date = null;
		try {
			if (null != dateStr && !"".equals(dateStr)) {
				date = sdf.parse(dateStr);
			}
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return date;
	}
	public static Date StringToDateFormatYMDHMS(String dateStr) {
		DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date date = null;
		try {
			if (null != dateStr && !"".equals(dateStr)) {
				date = sdf.parse(dateStr);
			}
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return date;
	}
	/**
	 * 定时任务需要的函数，
	 * @param dayNum 提前几天
	 * @param stateData 需要毕竟的日期
	 * @return
	 */
	public static int getDateDifferenceMethod(int dayNum, Date stateData) {
		if (null == stateData) {
			return -3;
		}
		if (0 != dayNum) {
			long l = stateData.getTime() - 24 * 60 * 60 * dayNum * 1000;
			stateData.setTime(l);
		}
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date date = new Date();
		String nowTimeStr = sdf.format(date);
		String oldDateStr = sdf.format(stateData);
		if (nowTimeStr.equals(oldDateStr)) {
			return 0;
		} else {
			return -1;
		}
	}
	/**
	 * 获取系统当前时间，格式为 yyyy-MM
	 * @return
	 */
	public static Date getNowYearAndMonth() {
		Date nowDate = new Date();
		DateFormat sdf = new SimpleDateFormat("yyyy-MM");
		String nowDateStr = sdf.format(nowDate);
		try {
			return sdf.parse(nowDateStr);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	/**
	 * 把日期格式化，格式为 yyyy-MM
	 * @return 一个字符串 格式为 yyyy-MM
	 */
	public static String getYearMonthStr(Date yearMonth) {
		return new SimpleDateFormat("yyyy-MM").format(yearMonth);
	}
	/**
	 * 把日期格式化，格式为 yyyy-MM-dd
	 * @return 一个字符串 格式为 yyyy-MM-dd
	 */
	public static String getYearMonthDayStr(Date yearMonth) {
		return new SimpleDateFormat("yyyy-MM-dd").format(yearMonth);
	}
	/**
	 * 获取两个日期之间所有年月列表 唐登强 2012-11-7
	 * @param start
	 * @param end
	 * @return
	 */
	public static List<Date> getBetweenDate(Date start, Date end) {
		List<Date> lists = new ArrayList<Date>();
		int months = 0;
		if (DateUtils.compareTo(start, end) > 0) {
			Date temp = start;
			start = end;
			end = temp;
		}
		Calendar sCalendar = Calendar.getInstance();
		sCalendar.setTime(start);
		int startYear = sCalendar.get(Calendar.YEAR);
		int startMonth = sCalendar.get(Calendar.MONTH);
		sCalendar.get(Calendar.YEAR);
		Calendar eCalendar = Calendar.getInstance();
		eCalendar.setTime(end);
		int endYear = eCalendar.get(Calendar.YEAR);
		int endMonth = eCalendar.get(Calendar.MONTH);
		eCalendar.get(Calendar.YEAR);
		months = endMonth - startMonth + (endYear - startYear) * 12;
		lists.add(sCalendar.getTime());
		for (int i = 1; i < months; i++) {
			sCalendar.add(Calendar.MONTH, 1);
			lists.add(sCalendar.getTime());
		}
		lists.add(eCalendar.getTime());
		return lists;
	}
	/**
	 * 比较两个日期的大小，如果返回0说明两个相等，如果前一个小于（早）后面一个返回负数，如果大于后面的日期则返回正数
	 * @param start 开始日期
	 * @param end 结束日期
	 * @return
	 */
	public static int compareTo(Date start, Date end) {
		int result = 0;
		Calendar sCalendar = Calendar.getInstance();
		sCalendar.setTime(start);
		Calendar eCalendar = Calendar.getInstance();
		eCalendar.setTime(end);
		result = sCalendar.compareTo(eCalendar);
		return result;
	}
	/**
	 * 根据start日期加上day天，获取day后的日期
	 * @param start 开始日期
	 * @param day 需要添加的天数
	 * @return
	 * @throws ParseException
	 */
	public static Date addDate(Date start, long day) {
		long time = start.getTime();
		day = day * 24 * 60 * 60 * 1000;
		time += day;
		return new Date(time);
	}
	/**
	 * 得到本月的第一天
	 * @return
	 */
	public static Date getMonthFirstDay() {
		Calendar calendar = Calendar.getInstance();
		calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMinimum(Calendar.DAY_OF_MONTH));
		return calendar.getTime();
	}
	/**
	 * 得到本月的最后一天
	 * @return
	 */
	public static Date getMonthLastDay() {
		Calendar calendar = Calendar.getInstance();
		calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
		return calendar.getTime();
	}
	public static void main(String[] args) {
		Calendar cal = Calendar.getInstance();
		cal.set(2013, 1, 3);
		Date date = cal.getTime();
		int dayNum = 2;
		DateUtils.getDateDifferenceMethod(dayNum, date);
	}
}
```
