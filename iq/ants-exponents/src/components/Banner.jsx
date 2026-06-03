// Full-color hero banner (matches the rest of the Ants & ___ family).
export default function Banner() {
  return (
    <div className="no-print w-full bg-white shadow-md py-4">
      <div className="max-w-3xl mx-auto px-4">
        <img
          src="/banner-ants-exponents.png"
          alt="Ants & Exponents — the fast way to multiply"
          className="h-36 w-auto object-contain mx-auto rounded-xl"
        />
      </div>
    </div>
  )
}
