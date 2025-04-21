"use client";
// This component uses the Geolocation API to get the user's current location
import { useEffect, useState } from "react";

export default function Location() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [avgSnr, setAvgSnr] = useState("");
  const [gpsStrength, setGpsStrength] = useState(""); // GPS強度のステートを追加
  const [target, setTarget] = useState("");
  const [area, setArea] = useState("");
  const [point, setPoint] = useState("");
  const [attempts, setAttempts] = useState("");
  const [os, setOs] = useState(""); // OSのステートを追加

  useEffect(() => {
    console.log(
      latitude,
      longitude,
      error,
      avgSnr,
      gpsStrength,
      target,
      area,
      point,
      attempts,
      os
    );
  }, [latitude, longitude, error, avgSnr, gpsStrength, target, area, point, attempts, os]);

  const targetPlaces = [
    "プレイング・ウィズおさるのジョージ",
    "ユニバーサル・モンスター・ライブ・ロックンロール・ショー",
    "ルイズ・N.Y.ピザパーラー",
    "メルズ・ドライブ・イン",
    "ザ・ドラゴンズ・パール",
    "ディスカバリー・レストラン",
    "ロストワールド・レストラン",
    "ウォーターワールド",
    "アミティ・ランディング・レストラン",
    "キノピオ・カフェ",
    "三本の箒",
  ];

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude.toString());
          setLongitude(longitude.toString());
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("このブラウザは位置情報取得に対応していません。");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      latitude,
      longitude,
      target,
      area,
      point,
      attempts,
      avgSnr,
      gpsStrength,
      os, // OSを送信データに追加
    };

    try {
      const response = await fetch("/api/add-to-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("データがGoogle Spreadsheetに追加されました！");
        setLatitude("");
        setLongitude("");
        setTarget("");
        setArea("");
        setPoint("");
        setAttempts("");
        setAvgSnr("");
        setGpsStrength("");
        setOs(""); // OSをリセット
      } else {
        alert("データの追加に失敗しました。");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">現在の位置情報</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-x-4">
          <label htmlFor="latitude" className="w-32 font-medium">
            緯度:
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            readOnly
            placeholder="緯度がここに表示されます"
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="longitude" className="w-32 font-medium">
            経度:
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            readOnly
            placeholder="経度がここに表示されます"
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="target" className="w-32 font-medium">
            ターゲット:
          </label>
          <select
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          >
            <option value="" disabled>
              選択してください
            </option>
            {targetPlaces.map((el) => {
              return (
                <option value={el} key={el}>
                  {el}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="area" className="w-32 font-medium">
            エリア:
          </label>
          <select
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="area1">エリア1</option>
            <option value="area2">エリア2</option>
            <option value="area3">エリア3</option>
          </select>
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="point" className="w-32 font-medium">
            位置:
          </label>
          <select
            id="point"
            value={point}
            onChange={(e) => setPoint(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="point1">北東</option>
            <option value="point2">北西</option>
            <option value="point3">南東</option>
            <option value="point4">南西</option>
          </select>
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="attempts" className="w-32 font-medium">
            試行回数:
          </label>
          <select
            id="attempts"
            value={attempts}
            onChange={(e) => setAttempts(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="1">1回目</option>
            <option value="2">2回目</option>
            <option value="3">3回目</option>
          </select>
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="avgSnr" className="w-32 font-medium">
            AVG SNR:
          </label>
          <input
            type="number"
            id="avgSnr"
            value={avgSnr}
            onChange={(e) => setAvgSnr(e.target.value)}
            placeholder="数値を入力してください"
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="gpsStrength" className="w-32 font-medium">
            GPS強度:
          </label>
          <input
            type="number"
            id="gpsStrength"
            value={gpsStrength}
            onChange={(e) => setGpsStrength(e.target.value)}
            placeholder="GPS強度を入力してください"
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="os" className="w-32 font-medium">
            OS:
          </label>
          <select
            id="os"
            value={os}
            onChange={(e) => setOs(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
          </select>
        </div>
        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={handleGetLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            位置情報を取得
          </button>
        </div>
        <div className="flex gap-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Google Spreadsheet に送信
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">エラー: {error}</p>}
    </div>
  );
}
