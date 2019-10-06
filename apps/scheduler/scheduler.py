# -*- coding: utf-8 -*-

from __future__ import print_function, division

import os
import unicodecsv as csv
import json
from datetime import datetime, date, time, timedelta

this_sem_year = "1920a"
days_list = [u"dimanĉo", u"lundo", u"mardo", u"merkredo", u"ĵaŭdo", u"vendredo", u"sabato"]

def csv_to_sched_obj(sched_path):
    scheds = [[] for x in range(7)]

    with open(sched_path, 'rb') as f:
        line_reader = csv.reader(f, encoding='utf-8')

        for each_line in line_reader:
            try:
                day_idx, course_name, start_time, end_time = tuple(each_line)
                day_idx = int(day_idx)
                start_time = datetime.strptime(start_time, "%I:%M %p").time()
                end_time = datetime.strptime(end_time, "%I:%M %p").time()

                if day_idx < 7:
                    scheds[day_idx].append((course_name, start_time, end_time))
            except Exception as e:
                break

    return scheds

def get_schedule_files(memtype_dir, ay_dir):
    dirpath = os.path.join('schedules/', memtype_dir, ay_dir)
    filelist = [f for f in os.listdir(dirpath) if os.path.isfile(os.path.join(dirpath, f))]
    schedlist = [f for f in filelist if os.path.splitext(f)[1].lower() == ".csv"]

    return [os.path.join(dirpath, f) for f in schedlist]

def save_unified_sched(scheds_tm):
    with open('unified_scheds.csv', 'wb') as f:
        line_writer = csv.writer(f, encoding='utf-8')

        csv_line = days_list
        csv_line.insert(0, "")
        line_writer.writerow(csv_line)

        for time_idx, each_time_obj in enumerate(scheds_tm):
            time_hour = int(time_idx / 4)
            time_minute = int((time_idx % 4) * 15)

            csv_line = ['' for i in range(8)]
            csv_line[0] = '{:02d}{:02d}h'.format(time_hour, time_minute)

            for day_idx, each_day_obj in enumerate(each_time_obj):
                if len(each_day_obj) <= 0:
                    continue

                busy_people = reduce(lambda x, y: x + '\n' + y, [e[0] for e in each_day_obj])
                csv_line[day_idx + 1] = busy_people

            line_writer.writerow(csv_line)

if __name__ == "__main__":
    all_scheds = [[[] for i in range(95)] for i in range(7)]
    all_scheds_tm = [[[] for i in range(7)] for i in range(95)]
    schedfiles_list = get_schedule_files("members", this_sem_year)

    for each_sched_path in schedfiles_list:
        csv_path_name = os.path.splitext(os.path.basename(each_sched_path))[0]
        each_sched_obj = csv_to_sched_obj(each_sched_path)

        # Loop everyday from Sunday to Saturday
        for day_idx, each_day_obj in enumerate(each_sched_obj):
            # Iterate through each class
            for each_event_tuple in each_day_obj:
                # Get time details of each class
                class_name, start_time, end_time = each_event_tuple

                # Loop through whole duration of event and save chunks
                # Assume chunks are multiples of 15 minutes
                # Times are converted to linear indices from 0000h (0) to 2345h (95)
                while start_time < end_time:
                    timetable_idx = int((start_time.hour * 4) + (start_time.minute / 15))
                    all_scheds[day_idx][timetable_idx].append((csv_path_name, class_name))
                    all_scheds_tm[timetable_idx][day_idx].append((csv_path_name, class_name))

                    # Add 15 minutes every iteration
                    start_time = datetime.combine(date.today(), start_time) +  timedelta(minutes=15)
                    start_time = start_time.time()

    # Write consolidated schedules to JSON file in "days-major" format
    with open('unified_scheds_dm.json', 'wb') as f:
        json.dump(all_scheds, f, sort_keys=True, indent=4, separators=(',', ':'))

    # Write consolidated schedules to JSON file in "time-major" format
    with open('unified_scheds_tm.json', 'wb') as f:
        json.dump(all_scheds_tm, f, sort_keys=True, indent=4, separators=(',', ':'))

    save_unified_sched(all_scheds_tm)

    '''
    print('Total number of members:', len(schedfiles_list))
    print('Not available dates for everyone')
    for day_idx, all_timetable in enumerate(all_scheds):
        print('-----', days_list[day_idx], '-----')

        for time_idx, each_timetable in enumerate(all_timetable):
            if len(each_timetable) <= 0:
                continue

            time_hour = int(time_idx / 4)
            time_minute = int(time_idx % 4) * 15

            print(4 * ' ', time_hour, time_minute)

            for each_sched in each_timetable:
                print(8 * ' ', each_sched[0], each_sched[1])
    '''