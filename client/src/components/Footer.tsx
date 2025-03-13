import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/public/logo.svg" 
              alt="Hub Madridista Logo" 
              className="h-8 mr-2" 
            />
            <span className="text-gray-700 font-medium">
              Hub<span className="text-[#FEF08A]">Madridista</span> &copy; {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              Términos de servicio
            </a>
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              Política de privacidad
            </a>
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              Contacto
            </a>
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              <i className="fab fa-facebook text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              <i className="fab fa-instagram text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#1E3A8A] transition-colors duration-200">
              <i className="fab fa-youtube text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
