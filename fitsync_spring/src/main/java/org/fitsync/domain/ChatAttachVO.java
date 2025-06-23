package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatAttachVO {
	private int attach_idx, message_idx;
	private long file_size_bytes;
	private String original_filename, cloudinary_url, cloudinary_public_id, mime_type, file_extension;
	private Timestamp uploaddate;
}