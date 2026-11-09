export function validateStudent(form) {
  const errors = {};
  for (const [field, label] of [
    ["fullName", "ФИО"],
    ["group", "Группа"],
    ["dormitory", "Общежитие"],
  ]) {
    if (!form[field]?.trim()) errors[field] = `${label}: заполните поле`;
  }
  if (form.fullName.length > 255) errors.fullName = "Не более 255 символов";
  if (form.dormitory.length > 255) errors.dormitory = "Не более 255 символов";
  if (!/^[A-Za-z][0-9]{4}$/.test(form.group))
    errors.group = "Формат группы: P3320";
  if (!Number.isSafeInteger(Number(form.isuId)) || Number(form.isuId) <= 0)
    errors.isuId = "Введите положительный целый ИСУ ID";
  if (
    !Number.isInteger(Number(form.room)) ||
    Number(form.room) <= 0 ||
    Number(form.room) > 2147483647
  )
    errors.room = "Введите положительный целый номер комнаты";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.moveInDate))
    errors.moveInDate = "Укажите дату заселения";
  return errors;
}
export function validateCredentials(form, registering) {
  const errors = {};
  if (!form.username.trim()) errors.username = "Введите имя пользователя";
  if (!form.password.trim()) errors.password = "Введите пароль";
  if (registering) {
    if (form.username.trim().length < 3 || form.username.trim().length > 100)
      errors.username = "От 3 до 100 символов";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ||
      form.email.length > 255
    )
      errors.email = "Введите корректный email";
    if (form.password.length < 8 || form.password.length > 100)
      errors.password = "Пароль: от 8 до 100 символов";
    if (new TextEncoder().encode(form.password).length > 72)
      errors.password = "Пароль должен занимать не более 72 байт UTF-8";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Пароли не совпадают";
  }
  return errors;
}
