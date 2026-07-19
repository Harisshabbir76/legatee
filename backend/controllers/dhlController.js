const fetch = require("node-fetch");

const DHL_BASE_URL = process.env.DHL_BASE_URL || "https://express.api.dhl.com/mydhlapi/test";

// ─── Helper ─────────────────────────────────────────────────────────────────
function dhlHeaders() {
  const creds = Buffer.from(
    `${process.env.DHL_API_KEY || ""}:${process.env.DHL_API_SECRET || ""}`
  ).toString("base64");
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${creds}`,
  };
}

// ─── Get Shipping Rates ───────────────────────────────────────────────────────
exports.getRates = async (req, res, next) => {
  try {
    const { toCity, toPostalCode, weight } = req.body;

    const today = new Date();
    const plannedDate = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const params = new URLSearchParams({
      accountNumber: process.env.DHL_ACCOUNT_NUMBER || "",
      originCountryCode: "AE",
      originCityName: "Dubai",
      destinationCountryCode: "AE",
      destinationCityName: toCity || "Abu Dhabi",
      weight: String(weight || 0.5),
      length: "20",
      width: "15",
      height: "10",
      plannedShippingDate: plannedDate,
      isCustomsDeclarable: "false",
      unitOfMeasurement: "metric",
    });

    const response = await fetch(`${DHL_BASE_URL}/rates?${params.toString()}`, {
      method: "GET",
      headers: dhlHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        message: data.detail || "Failed to fetch DHL rates.",
        details: data,
      });
    }

    // Return simplified rates list
    const rates = (data.products || []).map((p) => ({
      productCode: p.productCode,
      productName: p.productName,
      totalPrice: p.totalPrice?.[0]?.price ?? 0,
      currency: p.totalPrice?.[0]?.priceCurrency ?? "AED",
      deliveryTime: p.deliveryCapabilities?.estimatedDeliveryDateAndTime ?? null,
    }));

    return res.status(200).json({ rates });
  } catch (err) {
    next(err);
  }
};

// ─── Create Shipment ─────────────────────────────────────────────────────────
exports.createShipment = async (req, res, next) => {
  try {
    const { orderId, buyer, weight, productDescription } = req.body;

    const today = new Date();
    const plannedDate = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const payload = {
      plannedShippingDateAndTime: `${plannedDate}T10:00:00 GMT+04:00`,
      pickup: { isRequested: false },
      productCode: "N",
      accounts: [{ typeCode: "shipper", number: process.env.DHL_ACCOUNT_NUMBER || "" }],
      outputImageProperties: {
        printerDPI: 300,
        encodingFormat: "pdf",
        imageOptions: [{ typeCode: "label", templateName: "ECOM26_84_001" }],
      },
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            addressLine1: "Business Bay",
            cityName: "Dubai",
            countryCode: "AE",
            postalCode: "00000",
          },
          contactInformation: {
            email: "info@legatee.com",
            phone: "+971500000000",
            companyName: "LEGATEE",
            fullName: "LEGATEE Store",
          },
        },
        receiverDetails: {
          postalAddress: {
            addressLine1: buyer.address || "UAE Address",
            cityName: buyer.city || "Dubai",
            countryCode: "AE",
            postalCode: buyer.postalCode || "00000",
          },
          contactInformation: {
            email: buyer.email,
            phone: buyer.phone,
            fullName: buyer.name,
          },
        },
      },
      content: {
        packages: [
          {
            weight: weight || 0.5,
            dimensions: { length: 20, width: 15, height: 10 },
          },
        ],
        isCustomsDeclarable: false,
        description: productDescription || "Fragrance",
        incoterm: "DAP",
        unitOfMeasurement: "metric",
      },
      shipmentTrackingNumber: orderId,
    };

    const response = await fetch(`${DHL_BASE_URL}/shipments`, {
      method: "POST",
      headers: dhlHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        message: data.detail || "Failed to create DHL shipment.",
        details: data,
      });
    }

    return res.status(200).json({
      trackingNumber: data.shipmentTrackingNumber,
      labelUrl: data.documents?.[0]?.content ?? null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Track Shipment ───────────────────────────────────────────────────────────
exports.trackShipment = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;

    const response = await fetch(
      `${DHL_BASE_URL}/tracking?shipmentTrackingNumber=${trackingNumber}`,
      { headers: dhlHeaders() }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        message: data.detail || "Failed to track shipment.",
        details: data,
      });
    }

    const shipment = data.shipments?.[0];
    return res.status(200).json({
      status: shipment?.status ?? "Unknown",
      events: (shipment?.events || []).map((e) => ({
        timestamp: e.timestamp,
        location: e.location?.address?.addressLocality,
        description: e.description,
      })),
    });
  } catch (err) {
    next(err);
  }
};
