import { expect, test } from "@playwright/test";
import {
  DEMO_CARD,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isExpiryValid,
  luhnValid,
  validateCard,
} from "../../src/lib/card";
import { SA_PLACES, nearestPlace } from "../../src/lib/sa-locations";

test.describe("card engine", () => {
  test("detects the major networks from partial numbers", () => {
    expect(detectCardBrand("4").id).toBe("visa");
    expect(detectCardBrand("51").id).toBe("mastercard");
    expect(detectCardBrand("2221 00").id).toBe("mastercard");
    expect(detectCardBrand("34").id).toBe("amex");
    expect(detectCardBrand("6011").id).toBe("discover");
    expect(detectCardBrand("").id).toBe("unknown");
  });

  test("applies the Luhn checksum", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("5555555555554444")).toBe(true);
    expect(luhnValid("378282246310005")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(luhnValid("1234")).toBe(false);
  });

  test("formats each brand into its own grouping", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
    expect(formatCardNumber("5555555555554444")).toBe("5555 5555 5555 4444");
  });

  test("normalises expiry input and rejects expired cards", () => {
    expect(formatExpiry("1230")).toBe("12/30");
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("3")).toBe("03");
    expect(isExpiryValid("12/30")).toBe(true);
    expect(isExpiryValid("01/20")).toBe(false);
    expect(isExpiryValid("13/30")).toBe(false);
  });

  test("accepts the demo card and rejects incomplete details", () => {
    expect(validateCard(DEMO_CARD)).toEqual({});
    const errors = validateCard({
      number: "4242",
      name: "A",
      expiry: "01/20",
      cvv: "1",
    });
    expect(Object.keys(errors).sort()).toEqual(["cvv", "expiry", "name", "number"]);
  });
});

test.describe("South African places", () => {
  test("covers every province with usable coordinates", () => {
    const provinces = new Set(SA_PLACES.map((place) => place.province));
    expect(provinces.size).toBe(9);
    expect(SA_PLACES.length).toBeGreaterThan(900);
    expect(SA_PLACES.every((place) => place.name && place.lat && place.lng)).toBe(true);
  });

  test("resolves live coordinates to the nearest town", () => {
    const joburg = nearestPlace(-26.2041, 28.0473);
    expect(joburg.province).toBe("Gauteng");
    expect(joburg.name.toLowerCase()).toContain("johannesburg");

    const capeTown = nearestPlace(-33.9249, 18.4241);
    expect(capeTown.province).toBe("Western Cape");

    const durban = nearestPlace(-29.8587, 31.0218);
    expect(durban.province).toBe("KwaZulu-Natal");
  });
});
