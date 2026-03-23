import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRoutes } from '../../routes/auth.route';
import useFormFields from '../../shared/hooks/use-form-fields';
import AuthRouteLink from '../components/AuthRouteLink';
import RegisterForm from '../components/RegisterForm';

function Register() {
  const navigate = useNavigate();
  const { form, changeHandler, resetForm } = useFormFields({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async event => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Dang ky that bai.');
      }

      setSuccessMessage(payload.message || 'Dang ky thanh cong. Ban co the dang nhap ngay.');
      resetForm();
      navigate(authRoutes.verifyEmail, {
        state: {
          email: payload.email || form.email
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Tao tai khoan moi</p>
      <h1>Tao tai khoan dung thu mien phi</h1>
      <p className="description">
        Dien thong tin can thiet de tao tai khoan theo dung cau truc backend hien tai.
      </p>

      <RegisterForm
        form={form}
        isLoading={isLoading}
        onChange={changeHandler}
        onSubmit={submitHandler}
      />

      <div className="authMeta">
        <span>Da co tai khoan?</span>
        <AuthRouteLink to={authRoutes.login}>Dang nhap</AuthRouteLink>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}

export default Register;
