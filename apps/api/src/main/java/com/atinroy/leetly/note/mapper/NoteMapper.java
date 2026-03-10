package com.atinroy.leetly.note.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.atinroy.leetly.note.dto.NoteDto;
import com.atinroy.leetly.note.model.Note;

@Mapper(componentModel = "spring")
public interface NoteMapper {

    @Mapping(target = "problemId", source = "problem.id")
    NoteDto toDto(Note note);
}
