import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - GlobalPro',
  description: 'Kebijakan Privasi Aplikasi GlobalPro',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Kebijakan Privasi Aplikasi GlobalPro</h1>
          <p className="text-muted-foreground">Diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-foreground">
          {/* Introduction */}
          <section>
            <p className="text-muted-foreground leading-relaxed">
              Kebijakan Privasi ini menjelaskan bagaimana aplikasi GlobalPro (&quot;Kami&quot;) mengumpulkan, menggunakan, dan melindungi informasi pengguna yang menggunakan aplikasi mobile kami. Aplikasi ini dirancang sebagai Sistem Informasi Manajemen Kehadiran dan Employee Self Service (ESS) internal.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Untuk menunjang fitur operasional dalam aplikasi, kami memerlukan akses ke beberapa fitur sensitif pada perangkat Anda:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Informasi Lokasi (GPS):</span> Kami mengumpulkan data lokasi presisi (ACCESS_FINE_LOCATION &amp; ACCESS_COARSE_LOCATION) saat Anda melakukan absensi. Data ini digunakan murni untuk memverifikasi apakah Anda berada di dalam radius area kerja yang telah ditentukan.
              </li>
              <li>
                <span className="font-semibold text-foreground">Kamera:</span> Kami memerlukan akses Kamera perangkat Anda untuk fitur dokumentasi foto selfie saat absensi masuk/pulang serta pengambilan foto bukti dokumentasi saat melakukan patroli lapangan.
              </li>
              <li>
                <span className="font-semibold text-foreground">Penyimpanan &amp; Galeri Media (Storage):</span> Kami memerlukan izin akses ke galeri penyimpanan foto/file Anda untuk kebutuhan mengunggah dokumen pendukung, seperti foto bukti patroli atau dokumen surat keterangan sakit.
              </li>
              <li>
                <span className="font-semibold text-foreground">Push Notifications:</span> Kami memerlukan izin untuk mengirimkan notifikasi ke perangkat Anda guna memberikan pengingat waktu absensi, informasi patroli, dan pengumuman internal perusahaan lainnya.
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Keamanan Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami sangat berkomitmen untuk menjaga keamanan informasi Anda. Seluruh data yang dikumpulkan melalui aplikasi ini ditransmisikan secara aman menggunakan enkripsi standar industri dan hanya disimpan pada server database internal aman kami untuk kebutuhan administratif HRIS perusahaan. Kami tidak akan pernah menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga di luar kepentingan operasional internal perusahaan.
            </p>
          </section>

          {/* User Consent */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Persetujuan Pengguna</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dengan mengunduh dan menggunakan aplikasi GlobalPro, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini. Anda dapat menolak atau mencabut izin akses fitur (seperti lokasi atau kamera) kapan saja melalui pengaturan sistem di perangkat Handphone Anda, namun hal tersebut dapat menyebabkan beberapa fungsi utama aplikasi tidak dapat berjalan optimal.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Hubungi Kami</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau penggunaan data dalam aplikasi, silakan hubungi tim administrasi IT kami melalui email resmi perusahaan.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} GlobalPro. Semua hak dilindungi. Kebijakan privasi ini disediakan untuk kepatuhan terhadap persyaratan toko aplikasi.
          </p>
        </div>
      </div>
    </div>
  )
}
