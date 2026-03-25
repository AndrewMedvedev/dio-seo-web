import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  // Определяем активную вкладку
  const isContentGen =
    location.pathname === "/" ||
    location.pathname.startsWith("/generate/content");
  const isPromotion = location.pathname.startsWith("/seo");

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-neutral-800/50">
      <div className="flex h-20 lg:h-24 items-center px-6 lg:px-12 max-w-screen-2xl mx-auto">
        {/* Логотип слева */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img
            src="http://80.93.62.177:8000/media/images/Logo_bez_fona_bez_teksta.width-80.height-80.png"
            alt="Логотип"
            className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
          />
          <span className="hidden sm:block text-white font-semibold text-xl tracking-tight">
            ДИО-Консалт
          </span>
        </Link>

        {/* Пространство, толкающее кнопки вправо */}
        <div className="flex-1" />

        {/* Кнопки с увеличенным расстоянием */}
        <div className="flex items-center gap-12 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-2">
          <Link
            to="/generate/content"
            className={`px-9 py-3.5 rounded-2xl text-base font-medium transition-all ${
              isContentGen
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            Генерация контента
          </Link>

          <Link
            to="/seo"
            className={`px-9 py-3.5 rounded-2xl text-base font-medium transition-all ${
              isPromotion
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            Продвижение сайта
          </Link>
        </div>

        {/* Небольшой отступ справа */}
        <div className="w-6 lg:w-12 flex-shrink-0" />
      </div>
    </header>
  );
};

export default Header;
