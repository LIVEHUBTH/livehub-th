export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://livehubth.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=UTF-8",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    if (
      url.pathname !== "/api/payment" ||
      request.method !== "POST"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Not found",
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    try {
      const formData = await request.formData();

      const packageNumber = String(
        formData.get("packageNumber") || ""
      ).trim();

      const price = Number(formData.get("price"));
      const slip = formData.get("slip");

      const packagePrices = {
        "1": 99,
        "2": 199,
        "3": 149,
        "4": 249,
      };

      if (!packagePrices[packageNumber]) {
        return errorResponse(
          "หมายเลขแพ็กเกจไม่ถูกต้อง",
          400,
          corsHeaders
        );
      }

      if (packagePrices[packageNumber] !== price) {
        return errorResponse(
          "ราคาแพ็กเกจไม่ถูกต้อง",
          400,
          corsHeaders
        );
      }

      if (!(slip instanceof File) || slip.size === 0) {
        return errorResponse(
          "กรุณาแนบภาพสลิป",
          400,
          corsHeaders
        );
      }

      if (!slip.type.startsWith("image/")) {
        return errorResponse(
          "รองรับเฉพาะไฟล์รูปภาพ",
          400,
          corsHeaders
        );
      }

      const maximumSize = 5 * 1024 * 1024;

      if (slip.size > maximumSize) {
        return errorResponse(
          "ไฟล์สลิปต้องมีขนาดไม่เกิน 5 MB",
          400,
          corsHeaders
        );
      }

      const orderId =
        "LH-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        crypto.randomUUID()
          .replaceAll("-", "")
          .slice(0, 6)
          .toUpperCase();

      const extension = getImageExtension(slip.type);

      const slipKey =
        `slips/${orderId}.${extension}`;

      await env.SLIPS.put(
        slipKey,
        await slip.arrayBuffer(),
        {
          httpMetadata: {
            contentType: slip.type,
          },
          customMetadata: {
            orderId,
            packageNumber,
            price: String(price),
          },
        }
      );

      const createdAt = new Date().toISOString();

      try {
        await env.DB.prepare(
          `
          INSERT INTO orders (
            id,
            package_number,
            price,
            slip_key,
            status,
            created_at
          )
          VALUES (?, ?, ?, ?, 'pending', ?)
          `
        )
          .bind(
            orderId,
            packageNumber,
            price,
            slipKey,
            createdAt
          )
          .run();
      } catch (databaseError) {
        await env.SLIPS.delete(slipKey);
        throw databaseError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId,
          status: "pending",
          message:
            "ส่งสลิปสำเร็จ กรุณารอการตรวจสอบการชำระเงิน",
        }),
        {
          status: 201,
          headers: corsHeaders,
        }
      );
    } catch (error) {
      console.error("Payment API error:", error);

      return errorResponse(
        "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
        500,
        corsHeaders
      );
    }
  },
};

function errorResponse(message, status, headers) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    {
      status,
      headers,
    }
  );
}

function getImageExtension(contentType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  return extensions[contentType] || "jpg";
}
