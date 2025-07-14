import React, { useEffect, useState } from "react";
import styles from "./lyricsBar.module.css";
import { translateText } from "../../utils/apiUtils";
import { decodeHtmlEntities } from "../../utils/utils"; // adjust path as needed

const LyricsBar = ({
  currentLyrics = null,
  plainLyrics = null,
  refreshCurrentLyrics = () => {},
}) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [language, setLanguage] = useState("en");
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (currentLyrics == null && plainLyrics) {
      console.log("Using plain lyrics as fallback");
      console.log(plainLyrics);
    }
    const translateLyrics = async () => {
      if (!currentLyrics || currentLyrics.length === 0) {
        if (!plainLyrics || plainLyrics.length === 0) {
          setTranslatedLyrics([]);
          return;
        }
      }
      let lyricsToTranslate = currentLyrics;
      if (
        currentLyrics &&
        currentLyrics?.length > 0 &&
        !Array.isArray(currentLyrics[0])
      )
        lyricsToTranslate = currentLyrics;
      if (currentLyrics == null && plainLyrics && plainLyrics.length > 0) {
        lyricsToTranslate = [
          [null, plainLyrics],
          [null, null],
        ];
      }

      // // Fallback to plainLyrics if currentLyrics is not valid
      // if (
      //   !Array.isArray(lyricsToTranslate) ||
      //   !lyricsToTranslate.every(Array.isArray)
      // ) {
      //   if (plainLyrics && plainLyrics.length > 0) {
      //     alert(
      //       "only plain lyrics found for this song for now. we're working on it!"
      //     );
      //     lyricsToTranslate = [
      //       [null, plainLyrics],
      //       [null, null],
      //     ];
      //   } else {
      //     setTranslatedLyrics([]);
      //     return;
      //   }
      // }

      const translated = await Promise.all(
        lyricsToTranslate.map(async ([timestamp, line]) => {
          if (!line || line === "") return [timestamp, line];
          const translatedLine = await translateText(line, language);
          return [timestamp, translatedLine];
        })
      );
      setTranslatedLyrics(translated);
    };
    if (language != "") {
      translateLyrics();
    } else {
      setTranslatedLyrics(currentLyrics);
    }
  }, [currentLyrics, language, plainLyrics]);

  if (!currentLyrics || currentLyrics.length === 0) {
    if (!plainLyrics || plainLyrics.length === 0) {
      return <p className={styles.noLyrics}>No lyrics available</p>;
    }
  }

  return (
    <div className={`${styles.lyricsBar} ${minimized ? styles.minimized : ""}`}>
      <div
        className={styles.lyricsBarHeader}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1em",
          width: "100%",
        }}
      >
        <div
          className={styles.languageSelector}
          style={{ display: "flex", alignItems: "center" }}
        >
          <label htmlFor="language-select">Language: </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Original</option>
            <option value="fr">French</option>
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="hi">Hindi</option>
            <option value="ru">Russian</option>
            <option value="vi">Vietnamese</option>
            <option value="pl">Polish</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>
        <button
          className={styles.refreshButton}
          onClick={refreshCurrentLyrics}
          aria-label="Refresh lyrics"
        >
          🔃 refresh
        </button>
        <button
          className={styles.minimizeButton}
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? "Restore lyrics" : "Minimize lyrics"}
        >
          {minimized ? "🔼 restore" : "🔽 minimize"}
        </button>
      </div>
      {!minimized && (
        <>
          <p>♪ ... ♪</p>
          {translatedLyrics.slice(0, -1).map(([timestamp, line], idx) => (
            <div key={timestamp || idx} className={styles.lyricsLine}>
              <p>{line !== "" ? decodeHtmlEntities(line) : ""}</p>
            </div>
          ))}
          <p>♪ ... ♪</p>
        </>
      )}
    </div>
  );
};

export default LyricsBar;
