package za.co.thrift.eduthrift;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EduthriftApplication {
	public static void main(String[] args) {
		SpringApplication.run(EduthriftApplication.class, args);
	}

}
