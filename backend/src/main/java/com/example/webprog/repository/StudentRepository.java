package com.example.webprog.repository;

import com.example.webprog.dto.StudentCreateRequest;
import com.example.webprog.dto.StudentResponse;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import static org.jooq.impl.DSL.*;
import com.example.webprog.dto.PageResponse;
import org.jooq.Condition;
import org.jooq.SortField;

@Repository
public class StudentRepository {

    private final DSLContext dsl;

    private static final Table<Record> STUDENTS =
            table(name("students"));

    private static final Field<Long> ID =
            field(name("id"), Long.class);

    private static final Field<String> FULL_NAME =
            field(name("full_name"), String.class);

    private static final Field<String> STUDENT_GROUP =
            field(name("student_group"), String.class);

    private static final Field<Long> ISU_ID =
            field(name("isu_id"), Long.class);

    private static final Field<String> DORMITORY =
            field(name("dormitory"), String.class);

    private static final Field<Integer> ROOM =
            field(name("room"), Integer.class);

    private static final Field<LocalDate> MOVE_IN_DATE =
            field(name("move_in_date"), LocalDate.class);

    private static final Field<Boolean> FOREIGNER =
            field(name("foreigner"), Boolean.class);

    private static final Field<String> NOTES =
            field(name("notes"), String.class);

    public StudentRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public PageResponse<StudentResponse> findAll(
            String group,
            String dormitory,
            Long isuId,
            Integer room,
            Boolean foreigner,
            String search,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Condition condition = noCondition();

        if (group != null && !group.isBlank()) {
            condition = condition.and(
                    STUDENT_GROUP.eq(group)
            );
        }

        if (dormitory != null && !dormitory.isBlank()) {
            condition = condition.and(
                    DORMITORY.eq(dormitory)
            );
        }

        if (isuId != null) {
            condition = condition.and(
                    ISU_ID.eq(isuId)
            );
        }

        if (room != null) {
            condition = condition.and(
                    ROOM.eq(room)
            );
        }

        if (foreigner != null) {
            condition = condition.and(
                    FOREIGNER.eq(foreigner)
            );
        }

        if (search != null && !search.isBlank()) {
            condition = condition.and(
                    FULL_NAME.containsIgnoreCase(search)
                            .or(STUDENT_GROUP.containsIgnoreCase(search))
                            .or(DORMITORY.containsIgnoreCase(search))
                            .or(NOTES.containsIgnoreCase(search))
            );
        }


        Field<?> sortField = switch (sortBy) {
            case "fullName" -> FULL_NAME;
            case "group" -> STUDENT_GROUP;
            case "isuId" -> ISU_ID;
            case "dormitory" -> DORMITORY;
            case "room" -> ROOM;
            case "moveInDate" -> MOVE_IN_DATE;
            default -> ID;
        };


        SortField<?> orderBy;

        if ("desc".equalsIgnoreCase(direction)) {
            orderBy = sortField.desc();
        } else {
            orderBy = sortField.asc();
        }


        Long total = dsl
                .selectCount()
                .from(STUDENTS)
                .where(condition)
                .fetchOne(0, Long.class);

        if (total == null) {
            total = 0L;
        }


        List<StudentResponse> students = dsl
                .select(
                        ID,
                        FULL_NAME,
                        STUDENT_GROUP,
                        ISU_ID,
                        DORMITORY,
                        ROOM,
                        MOVE_IN_DATE,
                        FOREIGNER,
                        NOTES
                )
                .from(STUDENTS)
                .where(condition)
                .orderBy(orderBy, ID.asc())
                .limit(size)
                .offset(page * size)
                .fetch(record -> new StudentResponse(
                        record.get(ID),
                        record.get(FULL_NAME),
                        record.get(STUDENT_GROUP),
                        record.get(ISU_ID),
                        record.get(DORMITORY),
                        record.get(ROOM),
                        record.get(MOVE_IN_DATE),
                        record.get(FOREIGNER),
                        record.get(NOTES)
                ));


        int totalPages =
                (int) Math.ceil((double) total / size);


        return new PageResponse<>(
                students,
                page,
                size,
                total,
                totalPages
        );
    }

    public StudentResponse create(StudentCreateRequest request) {
        var record = dsl
                .insertInto(STUDENTS)
                .columns(
                        FULL_NAME,
                        STUDENT_GROUP,
                        ISU_ID,
                        DORMITORY,
                        ROOM,
                        MOVE_IN_DATE,
                        FOREIGNER,
                        NOTES
                )
                .values(
                        request.fullName(),
                        request.group(),
                        request.isuId(),
                        request.dormitory(),
                        request.room(),
                        request.moveInDate(),
                        request.foreigner(),
                        request.notes()
                )
                .returning(
                        ID,
                        FULL_NAME,
                        STUDENT_GROUP,
                        ISU_ID,
                        DORMITORY,
                        ROOM,
                        MOVE_IN_DATE,
                        FOREIGNER,
                        NOTES
                )
                .fetchOne();

        if (record == null) {
            return null;
        }

        return new StudentResponse(
                record.get(ID),
                record.get(FULL_NAME),
                record.get(STUDENT_GROUP),
                record.get(ISU_ID),
                record.get(DORMITORY),
                record.get(ROOM),
                record.get(MOVE_IN_DATE),
                record.get(FOREIGNER),
                record.get(NOTES)
        );
    }
    public StudentResponse findById(Long id) {
        var record = dsl
                .select(
                        ID,
                        FULL_NAME,
                        STUDENT_GROUP,
                        ISU_ID,
                        DORMITORY,
                        ROOM,
                        MOVE_IN_DATE,
                        FOREIGNER,
                        NOTES
                )
                .from(STUDENTS)
                .where(ID.eq(id))
                .fetchOne();

        if (record == null) {
            return null;
        }

        return new StudentResponse(
                record.get(ID),
                record.get(FULL_NAME),
                record.get(STUDENT_GROUP),
                record.get(ISU_ID),
                record.get(DORMITORY),
                record.get(ROOM),
                record.get(MOVE_IN_DATE),
                record.get(FOREIGNER),
                record.get(NOTES)
        );
    }


    public boolean deleteById(Long id) {
        int deletedRows = dsl
                .deleteFrom(STUDENTS)
                .where(ID.eq(id))
                .execute();

        return deletedRows > 0;
    }
    public boolean existsByIsuId(Long isuId) {
        Integer count = dsl
                .selectCount()
                .from(STUDENTS)
                .where(ISU_ID.eq(isuId))
                .fetchOne(0, Integer.class);

        return count != null && count > 0;
    }
    public boolean existsByIsuIdExceptId(
            Long isuId,
            Long id
    ) {
        Integer count = dsl
                .selectCount()
                .from(STUDENTS)
                .where(
                        ISU_ID.eq(isuId)
                                .and(ID.ne(id))
                )
                .fetchOne(0, Integer.class);

        return count != null && count > 0;
    }
    public StudentResponse update(
            Long id,
            StudentCreateRequest request
    ) {
        int updatedRows = dsl
                .update(STUDENTS)
                .set(FULL_NAME, request.fullName())
                .set(STUDENT_GROUP, request.group())
                .set(ISU_ID, request.isuId())
                .set(DORMITORY, request.dormitory())
                .set(ROOM, request.room())
                .set(MOVE_IN_DATE, request.moveInDate())
                .set(FOREIGNER, request.foreigner())
                .set(NOTES, request.notes())
                .where(ID.eq(id))
                .execute();

        if (updatedRows == 0) {
            return null;
        }

        return findById(id);
    }
}