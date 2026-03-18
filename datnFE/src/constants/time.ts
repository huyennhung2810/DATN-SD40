export const getGreeting = (): string => {
  // Lấy giờ hiện tại của thiết bị người dùng (từ 0 đến 23)
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Chào buổi sáng 🌅";
  } 
  if (currentHour >= 12 && currentHour < 18) {
    return "Chào buổi chiều ☀️";
  } 
  if (currentHour >= 18 && currentHour < 22) {
    return "Chào buổi tối 🌙";
  }
  return "Chào buổi khuya 🦉"; 
};