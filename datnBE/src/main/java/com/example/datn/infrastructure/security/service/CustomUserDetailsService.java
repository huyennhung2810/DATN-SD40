package com.example.datn.infrastructure.security.service;

import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.security.repository.AuthRoleRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Setter(onMethod = @__({@Autowired}))
    private AuthStaffRepository staffRepository;

    @Setter(onMethod = @__({@Autowired}))
    private AuthRoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<Employee> optionalStaff = staffRepository.findByUsername(username);

        if(username != null && optionalStaff.isPresent()) {
            Employee employee = optionalStaff.get();
            List<String> role = roleRepository.getRoleCodeByUsername(username);

            return UserPrincipal.create(employee, role);
        }

        throw new UsernameNotFoundException("Username not found : " + username);
    }
}
