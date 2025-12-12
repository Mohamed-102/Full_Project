import { assets } from "../assets/assets";

export default function Footer() {
    return (
        <div className="container px-4 2xl:px-20 mx-auto flex items-center justify-between gap-4 py-3 mt-20">
            {/* Website Title */}
            <div className="text-2xl font-bold">
                <span className="text-neutral-900">Job</span>
                <span className="text-blue-600">Connect</span>
            </div>
            <p className="flex-1 border-1 border-gray-400 text-sm text-gray-500 max-sm:hidden">Copyright @ELQadi-Chafiki | All right reserved.</p>
            <div className="flex gap-2.5">
                <img width={38} src={assets.facebook_icon} alt="" />
                <img width={38} src={assets.twitter_icon} alt="" />
                <img width={38} src={assets.instagram_icon} alt="" />
            </div>
        </div>
    );
}