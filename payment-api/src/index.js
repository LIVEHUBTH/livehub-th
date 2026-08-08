export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Admin-Token",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    try {
      /*
       * รับสลิปจากหน้าชำระเงิน
       */
      if (
        url.pathname === "/api/payment" &&
        request.method === "POST"
      ) {
        return await createPayment(
          request,
          env,
          corsHeaders
        );
      }

      /*
       * แอดมินดูรายการคำสั่งซื้อ
       * GET /api/admin/orders
       */
      if (
        url.pathname === "/api/admin/orders" &&
        request.method === "GET"
      ) {
        if (!isAdmin(request, env)) {
          return errorResponse(
            "ไม่มีสิทธิ์เข้าถึง",
            401,
            corsHeaders
          );
        }

        const status =
          url.searchParams.get("status") || "pending";

        const allowedStatuses = [
          "pending",
          "approved",
          "rejected",
          "all",
        ];

        if (!allowedStatuses.includes(status)) {
          return errorResponse(
            "สถานะไม่ถูกต้อง",
            400,
            corsHeaders
          );
        }

        let result;

        if (status === "all") {
          result = await env.DB.prepare(
            `
            SELECT
              id,
              package_number,
              price,
              slip_key,
              status,
              created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 100
            `
          ).all();
        } else {
          result = await env.DB.prepare(
            `
            SELECT
              id,
              package_number,
              price,
              slip_key,
              status,
              created_at
            FROM orders
            WHERE status = ?
            ORDER BY created_at DESC
            LIMIT 100
            `
          )
            .bind(status)
            .all();
        }

        return jsonResponse(
          {
            success: true,
            orders: result.results || [],
          },
          200,
          corsHeaders
        );
      }

      /*
       * แอดมินเปิดดูภาพสลิป
       * GET /api/admin/slip/ORDER_ID
       */
      if (
        url.pathname.startsWith("/api/admin/slip/") &&
        request.method === "GET"
      ) {
        if (!isAdmin(request, env)) {
          return errorResponse(
            "ไม่มีสิทธิ์เข้าถึง",
            401,
            corsHeaders
          );
        }

        const orderId = decodeURIComponent(
          url.pathname.replace("/api/admin/slip/", "")
        ).trim();

        if (!orderId) {
          return errorResponse(
            "ไม่พบเลขคำสั่งซื้อ",
            400,
            corsHeaders
          );
        }

        const order = await env.DB.prepare(
          `
          SELECT id, slip_key
          FROM orders
          WHERE id = ?
          LIMIT 1
          `
        )
          .bind(orderId)
          .first();

        if (!order) {
          return errorResponse(
            "ไม่พบคำสั่งซื้อ",
            404,
            corsHeaders
          );
        }

        const object = await env.SLIPS.get(
          order.slip_key
        );

        if (!object) {
          return errorResponse(
            "ไม่พบไฟล์สลิป",
            404,
            corsHeaders
          );
        }

        const headers = new Headers(corsHeaders);

        object.writeHttpMetadata(headers);

        headers.set(
          "Content-Type",
          object.httpMetadata?.contentType ||
            "image/jpeg"
        );

        headers.set(
          "Cache-Control",
          "private, no-store"
        );

        return new Response(object.body, {
          status: 200,
          headers,
        });
      }

      /*
       * อนุมัติหรือปฏิเสธคำสั่งซื้อ
       * POST /api/admin/orders/ORDER_ID/status
       */
      if (
        url.pathname.startsWith("/api/admin/orders/") &&
        url.pathname.endsWith("/status") &&
        request.method === "POST"
      ) {
        if (!isAdmin(request, env)) {
          return errorResponse(
            "ไม่มีสิทธิ์เข้าถึง",
            401,
            corsHeaders
          );
        }

        const orderId = decodeURIComponent(
          url.pathname
            .replace("/api/admin/orders/", "")
            .replace("/status", "")
        ).trim();

        if (!orderId) {
          return errorResponse(
            "ไม่พบเลขคำสั่งซื้อ",
            400,
            corsHeaders
          );
        }

        const body = await request.json();

        const newStatus = String(
          body.status || ""
        ).trim();

        if (
          newStatus !== "approved" &&
          newStatus !== "rejected"
        ) {
          return errorResponse(
            "สถานะต้องเป็น approved หรือ rejected",
            400,
            corsHeaders
          );
        }

        const existingOrder = await env.DB.prepare(
          `
          SELECT id, status
          FROM orders
          WHERE id = ?
          LIMIT 1
          `
        )
          .bind(orderId)
          .first();

        if (!existingOrder) {
          return errorResponse(
            "ไม่พบคำสั่งซื้อ",
            404,
            corsHeaders
          );
        }

        await env.DB.prepare(
          `
          UPDATE orders
          SET status = ?
          WHERE id = ?
          `
        )
          .bind(newStatus, orderId)
          .run();

        return jsonResponse(
          {
            success: true,
            orderId,
            status: newStatus,
            message:
              newStatus === "approved"
                ? "อนุมัติการชำระเงินสำเร็จ"
                : "ปฏิเสธการชำระเงินสำเร็จ",
          },
          200,
          corsHeaders
        );
      }

      return errorResponse(
        "Not found",
        404,
        corsHeaders
      );
    } catch (error) {
      console.error("Worker error:", error);

      return errorResponse(
        "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
        500,
        corsHeaders
      );
    }
  },
};

async function createPayment(
  request,
  env,
  corsHeaders
) {
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

  return jsonResponse(
    {
      success: true,
      orderId,
      status: "pending",
      message:
        "ส่งสลิปสำเร็จ กรุณารอการตรวจสอบการชำระเงิน",
    },
    201,
    corsHeaders
  );
}

function isAdmin(request, env) {
  if (!env.ADMIN_TOKEN) {
    return false;
  }

  const authorization =
    request.headers.get("Authorization") || "";

  const bearerToken = authorization.startsWith(
    "Bearer "
  )
    ? authorization.slice(7).trim()
    : "";

  const headerToken =
    request.headers.get("X-Admin-Token") || "";

  const suppliedToken =
    bearerToken || headerToken;

  return suppliedToken === env.ADMIN_TOKEN;
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type":
        "application/json; charset=UTF-8",
    },
  });
}

function errorResponse(
  message,
  status,
  corsHeaders
) {
  return jsonResponse(
    {
      success: false,
      message,
    },
    status,
    corsHeaders
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
