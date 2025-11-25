import React, { useState, useEffect } from "react";

function pad2(n) {
    return n < 10 ? `0${n}` : `${n}`;
}

function formatDateToDDMMYYYY(d) {
    if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseDDMMYYYY(str) {
    if (typeof str !== "string") return null;
    const m = str.match(/^\s*(\d{1,2})\s*\/?\s*(\d{1,2})\s*\/?\s*(\d{2,4})\s*$/);
    if (!m) return null;
    let day = parseInt(m[1], 10);
    let month = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    if (year < 100) {
        // assume 2000-2099 for 2-digit years; adapt if you need different behavior
        year += 2000;
    }
    // basic range checks
    if (month < 1 || month > 12) return null;
    if (day < 1) return null;
    const candidate = new Date(year, month - 1, day);
    if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return null;
    return candidate;
}

export default function DateInput({
    value = null,
    onChange = () => { },
    id,
    name,
    placeholder = "dd/mm/yyyy",
    className = "",
    required = false,
    disabled = false,
    ariaLabel,
}) {
    // internal text state
    const [text, setText] = useState(() => {
        if (!value) return "";
        if (value instanceof Date) return formatDateToDDMMYYYY(value);
        if (typeof value === "string") return value;
        return "";
    });
    const [error, setError] = useState(null);

    // keep text in sync if parent changes value
    useEffect(() => {
        if (value instanceof Date) {
            const v = formatDateToDDMMYYYY(value);
            if (v !== text) setText(v);
        } else if (typeof value === "string") {
            if (value !== text) setText(value);
        } else if (value === null) {
            if (text !== "") setText("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    function handleRawChange(e) {
        let v = e.target.value;
        // strip everything except digits and slashes
        v = v.replace(/[^0-9]/g, "");
        // auto-insert slashes: dd/mm/yyyy
        if (v.length <= 2) v = v;
        else if (v.length <= 4) v = `${v.slice(0, 2)}/${v.slice(2)}`;
        else v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4, 8)}`.slice(0, 10);
        setText(v);
        setError(null);
        // optimistic parse: if complete, call onChange with Date
        if (v.length === 10) {
            const parsed = parseDDMMYYYY(v);
            onChange(parsed, v);
        } else {
            onChange(null, v);
        }
    }

    function handleBlur() {
        if (!text) {
            setError(null);
            onChange(null, text);
            return;
        }
        const parsed = parseDDMMYYYY(text);
        if (!parsed) {
            setError("Ngày không hợp lệ");
            onChange(null, text);
            return;
        }
        // success
        setError(null);
        // normalize display (e.g. pad day/month)
        const normalized = formatDateToDDMMYYYY(parsed);
        setText(normalized);
        onChange(parsed, normalized);
    }

    function handleKeyDown(e) {
        // allow navigation keys, backspace, delete
        if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Tab") return;
        // prevent typing more than 10 characters
        if (text.length >= 10 && !(e.key === "Backspace" || e.key === "Delete")) {
            e.preventDefault();
        }
    }

    return (
        <div className="w-full">
            <input
                className={`${className}`}
                id={id}
                name={name}
                aria-label={ariaLabel || name || "date"}
                inputMode="numeric"
                autoComplete="off"
                placeholder={placeholder}
                value={text}
                onChange={handleRawChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                maxLength={10}
                required={required}
                disabled={disabled}
            />
            {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
    );
}
