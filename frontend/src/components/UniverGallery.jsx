const photos = [
  {
    file: "session-mood.jpg",
    caption: "Перед сессией",
    alt: "Герой «Универа» с серьёзным выражением лица",
  },
  {
    file: "lunch-break.jpg",
    caption: "После пар",
    alt: "Герой «Универа» в жёлтой футболке за обедом",
  },
  {
    file: "general-mayo.jpg",
    caption: "Порядок в общаге",
    alt: "Мем «Генерал Майонез»",
  },
];

export default function UniverGallery({ compact = false }) {
  return (
    <section
      className={`univer-banner${compact ? " univer-banner--compact" : ""}`}
      aria-label="Настроение новой общаги"
    >
      {!compact && (
        <div className="univer-intro">
          <p className="eyebrow">УНИВЕР / НАШИ ЛЮДИ</p>
          <h2>Знакомые лица. Новые заселения.</h2>
          <p>Комнаты под контролем, свои — на месте.</p>
        </div>
      )}
      <div className="univer-photos">
        {photos.map((photo) => (
          <figure key={photo.file}>
            <img
              src={`/images/univer/${photo.file}`}
              alt={photo.alt}
              width="120"
              height="120"
              loading="lazy"
            />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
