package com.atinroy.leetly.user;

import com.atinroy.leetly.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "themes")
public class Theme extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String properties;
}
