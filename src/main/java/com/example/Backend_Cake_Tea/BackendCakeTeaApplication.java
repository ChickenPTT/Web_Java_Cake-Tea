package com.example.Backend_Cake_Tea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendCakeTeaApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendCakeTeaApplication.class, args);
	}

}
