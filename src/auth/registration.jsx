import Input from "../components/input";

const Registration = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-black p-8 shadow-lg">
        <div className="flex justify-center">
          <img
            src="http://80.93.62.177:8000/media/images/Logo_bez_fona_bez_teksta.width-80.height-80.png"
            alt="Логотип"
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Регистрация</h1>
          <p className="mt-2 text-sm text-gray-100">
            Создайте аккаунт по приглашению
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              name="Имя пользователя"
              inputType="text"
              classNameInput="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white placeholder-gray-400"
              classNameLabel="block text-sm font-medium text-gray-300"
            />
            <Input
              name="ФИО"
              inputType="text"
              classNameInput="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white placeholder-gray-400"
              classNameLabel="block text-sm font-medium text-gray-300"
            />
            <Input
              name="Пароль"
              inputType="password"
              classNameInput="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white placeholder-gray-400"
              classNameLabel="block text-sm font-medium text-gray-300"
            />
            <Input
              name="Подтвердите пароль"
              inputType="password"
              classNameInput="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white placeholder-gray-400"
              classNameLabel="block text-sm font-medium text-gray-300"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
