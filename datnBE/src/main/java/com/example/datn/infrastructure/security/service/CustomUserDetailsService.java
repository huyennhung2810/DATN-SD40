package com.example.datn.infrastructure.security.service;

import com.example.datn.entity.Customer;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.security.repository.AuthCustomerRepository;
import com.example.datn.infrastructure.security.repository.AuthRoleRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.LockedException;
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
    private AuthCustomerRepository customerRepository;

    @Setter(onMethod = @__({@Autowired}))
    private AuthRoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null) {
            throw new UsernameNotFoundException("Username is null");
        }

        // Thử tìm Employee trước
        Optional<Employee> optionalStaff = staffRepository.findByUsername(username);

        if (optionalStaff.isPresent()) {
            Employee employee = optionalStaff.get();

            if (employee.getStatus() == EntityStatus.INACTIVE) {
                throw new LockedException("Tài khoản nhân viên đã bị khóa");
            }

            List<String> roles = roleRepository.getRoleCodeByUsername(username);
            return UserPrincipal.create(employee, roles);
        }

        Optional<Customer> optionalCustomer = customerRepository.findByAccountUsername(username);

        if (optionalCustomer.isPresent()) {
            Customer customer = optionalCustomer.get();

            if (customer.getStatus() == EntityStatus.INACTIVE) {
                throw new LockedException("Tài khoản khách hàng đã bị khóa");
            }

            List<String> roles = roleRepository.getRoleCodeByUsername(username);
            return UserPrincipal.create(customer, roles);
        }

            throw new UsernameNotFoundException("Username not found: " + username);
    }
}
