import { useState } from 'react';

function useFormFields(initialState) {
  const [form, setForm] = useState(initialState);

  const changeHandler = event => {
    const { name, value } = event.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const setFormData = nextState => {
    setForm(prevForm => ({
      ...prevForm,
      ...nextState
    }));
  };

  const resetForm = () => {
    setForm(initialState);
  };

  return { form, changeHandler, setFormData, resetForm };
}

export default useFormFields;
