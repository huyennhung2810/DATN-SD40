package com.example.datn.infrastructure.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;


@Service
@EnableAsync
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Async
    public void sendNewStaffEmail(String toEmail, String fullName, String staffCode, String username, String password) throws MessagingException {
        Context context = new Context();
        context.setVariable("fullName", fullName);
        context.setVariable("staffCode", staffCode);
        context.setVariable("username", username);
        context.setVariable("password", password);

        String html = templateEngine.process("new_staff_email", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true,"UTF-8");
        helper.setTo(toEmail);
        helper.setSubject("Thông tin tài khoản mới");
        helper.setText(html, true); // HTML
        mailSender.send(message);
    }
}
