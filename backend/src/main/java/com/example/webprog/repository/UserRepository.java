package com.example.webprog.repository;

import com.example.webprog.dto.UserResponse;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.*;

import com.example.webprog.security.UserAuthData;

@Repository
public class UserRepository {

    private final DSLContext dsl;


    private static final Table<Record> USERS =
            table(name("app_users"));


    private static final Field<Long> ID =
            field(name("id"), Long.class);

    private static final Field<String> USERNAME =
            field(name("username"), String.class);

    private static final Field<String> EMAIL =
            field(name("email"), String.class);

    private static final Field<String> PASSWORD_HASH =
            field(name("password_hash"), String.class);

    private static final Field<String> ROLE =
            field(name("role"), String.class);


    public UserRepository(DSLContext dsl) {
        this.dsl = dsl;
    }


    public boolean existsByUsername(String username) {
        return dsl.fetchExists(
                dsl.selectOne()
                        .from(USERS)
                        .where(USERNAME.eq(username))
        );
    }


    public boolean existsByEmail(String email) {
        return dsl.fetchExists(
                dsl.selectOne()
                        .from(USERS)
                        .where(EMAIL.eq(email))
        );
    }


    public UserResponse create(
            String username,
            String email,
            String passwordHash,
            String role
    ) {
        var record = dsl
                .insertInto(USERS)
                .columns(
                        USERNAME,
                        EMAIL,
                        PASSWORD_HASH,
                        ROLE
                )
                .values(
                        username,
                        email,
                        passwordHash,
                        role
                )
                .returning(
                        ID,
                        USERNAME,
                        EMAIL,
                        ROLE
                )
                .fetchOne();

        if (record == null) {
            return null;
        }

        return new UserResponse(
                record.get(ID),
                record.get(USERNAME),
                record.get(EMAIL),
                record.get(ROLE)
        );
    }
    public UserAuthData findAuthByUsername(
            String username
    ) {
        var record = dsl
                .select(
                        ID,
                        USERNAME,
                        PASSWORD_HASH,
                        ROLE
                )
                .from(USERS)
                .where(USERNAME.eq(username))
                .fetchOne();

        if (record == null) {
            return null;
        }

        return new UserAuthData(
                record.get(ID),
                record.get(USERNAME),
                record.get(PASSWORD_HASH),
                record.get(ROLE)
        );
    }
}