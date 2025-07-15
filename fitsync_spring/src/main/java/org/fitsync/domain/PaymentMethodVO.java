package org.fitsync.domain;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodVO {
    private int method_idx;
    private int member_idx;
    private String method_key;
    private String method_provider;
    private String method_name;
    private Date method_regdate;
    private String method_card;
    private String method_card_num;
}
