package com.atinroy.leetly.note;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NoteMapper {

    @Mapping(target = "problemId", source = "problem.id")
    NoteDto toDto(Note note);
}
