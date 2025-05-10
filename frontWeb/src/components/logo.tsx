import Image from 'next/image'
export default function Logo() {
  return (
    <div className="flex h-9 w-9 items-center rounded-full justify-center bg-gray-100 text-white dark:bg-slate-500  dark:text-black">
      <Image
      src="/logo.png"
      alt="Small Logo"
      width={28}
      height={28}
      className="rounded-full "
    />
    </div>
  )
}
