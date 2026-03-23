function LoginHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
        <i className="fa-solid fa-warehouse text-2xl text-white"></i>
      </div>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Quản lý kho vật tư
      </h1>
      <p className="mt-2 text-sm text-gray-500">Đăng nhập để tiếp tục</p>
    </div>
  );
}

export default LoginHeader;
