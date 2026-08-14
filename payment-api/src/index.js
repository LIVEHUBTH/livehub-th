export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
    const path = url.pathname;

    try {
      /*
       * =========================================
       * HEALTH
       * =========================================
       */

      if (
        path === "/api/health" &&
        request.method === "GET"
      ) {
        return jsonResponse(
          {
            success: true,
            service: "LIVEHUB TH API",
            status: "ok",
          },
          200,
          corsHeaders
        );
      }

      /*
       * =========================================
       * PUBLIC CONCERTS
       * =========================================
       */

      if (
        path === "/api/concerts" &&
        request.method === "GET"
      ) {
        return await getPublicConcerts(
          url,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * PUBLIC CONCERT COVER
       * =========================================
       */

      if (
        path.startsWith("/api/concert-cover/") &&
        request.method === "GET"
      ) {
        const coverKey =
          getPathId(
            path,
            "/api/concert-cover/"
          );

        return await getConcertCover(
          coverKey,
          env,
          corsHeaders
        );
      }
/*
 * =========================================
 * PUBLIC SITE ASSET
 * =========================================
 */

if (
  path.startsWith("/api/site-asset/") &&
  request.method === "GET"
) {
  const assetKey =
    getSiteAssetKey(
      path
    );

  return await getSiteAsset(
    assetKey,
    env,
    corsHeaders
  );
}
/*
 * ==========================================
 * PUBLIC SITE SETTINGS
 * ==========================================
 */

if (
  path === "/api/site-settings" &&
  request.method === "GET"
) {
  return await getSiteSettings(
    env,
    corsHeaders
  );
}
      /*
       * =========================================
       * PAYMENT
       * =========================================
       */

      if (
        path === "/api/payment" &&
        request.method === "POST"
      ) {
        return await createPayment(
          request,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * ACCESS VERIFY
       * =========================================
       */

      if (
        path === "/api/access/verify" &&
        request.method === "POST"
      ) {
        return await verifyAccessCode(
          request,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * VIEWING SESSION
       * =========================================
       */

      if (
        path === "/api/access/session/start" &&
        request.method === "POST"
      ) {
        return await startViewingSession(
          request,
          env,
          corsHeaders
        );
      }

      if (
        path === "/api/access/session/check" &&
        request.method === "POST"
      ) {
        return await checkViewingSession(
          request,
          env,
          corsHeaders
        );
      }

      if (
        path === "/api/access/session/end" &&
        request.method === "POST"
      ) {
        return await endViewingSession(
          request,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * LINE WEBHOOK
       * =========================================
       */

      if (
        path === "/api/line/webhook" &&
        request.method === "POST"
      ) {
        return await handleLineWebhook(
          request,
          env
        );
      }

      /*
       * =========================================
       * ADMIN AUTH
       * =========================================
       */

      if (
        path.startsWith("/api/admin/") &&
        !isAdmin(request, env)
      ) {
        return errorResponse(
          "ไม่มีสิทธิ์เข้าถึง",
          401,
          corsHeaders
        );
      }
/*
 * =========================================
 * ADMIN SITE SETTINGS / ASSETS
 * =========================================
 */

if (
  path === "/api/admin/site-settings" &&
  request.method === "GET"
) {
  return await getAdminSiteSettings(
    env,
    corsHeaders
  );
}

if (
  path === "/api/admin/site-settings" &&
  request.method === "POST"
) {
  return await updateSiteSettings(
    request,
    env,
    corsHeaders
  );
}

if (
  path === "/api/admin/site-assets" &&
  request.method === "POST"
) {
  return await uploadSiteAsset(
    request,
    env,
    corsHeaders
  );
}      /*
       * =========================================
       * ADMIN CONCERT COVER
       * =========================================
       */

      if (
        path === "/api/admin/concert-cover" &&
        request.method === "POST"
      ) {
        return await uploadConcertCover(
          request,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * ADMIN CONCERTS
       * =========================================
       */

      if (
        path === "/api/admin/concerts" &&
        request.method === "GET"
      ) {
        return await getAdminConcerts(
          env,
          corsHeaders
        );
      }

      if (
        path === "/api/admin/concerts" &&
        request.method === "POST"
      ) {
        return await createConcert(
          request,
          env,
          corsHeaders
        );
      }

      if (
        path.startsWith(
          "/api/admin/concerts/"
        ) &&
        request.method === "POST"
      ) {
        const concertId =
          getPathId(
            path,
            "/api/admin/concerts/"
          );

        return await updateConcert(
          concertId,
          request,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * ADMIN SESSIONS
       * =========================================
       */

      if (
        path === "/api/admin/sessions" &&
        request.method === "GET"
      ) {
        return await getSessions(
          url,
          env,
          corsHeaders
        );
      }

      if (
        path === "/api/admin/sessions" &&
        request.method === "POST"
      ) {
        return await createSession(
          request,
          env,
          corsHeaders
        );
      }

      if (
        path.startsWith(
          "/api/admin/sessions/"
        ) &&
        request.method === "POST"
      ) {
        const sessionId =
          getPathId(
            path,
            "/api/admin/sessions/"
          );

        return await updateSession(
          sessionId,
          request,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * ADMIN PACKAGES
       * =========================================
       */

      if (
        path === "/api/admin/packages" &&
        request.method === "GET"
      ) {
        return await getPackages(
          url,
          env,
          corsHeaders
        );
      }

      if (
        path === "/api/admin/packages" &&
        request.method === "POST"
      ) {
        return await createPackage(
          request,
          env,
          corsHeaders
        );
      }

      if (
        path.startsWith(
          "/api/admin/packages/"
        ) &&
        request.method === "POST"
      ) {
        const packageId =
          getPathId(
            path,
            "/api/admin/packages/"
          );

        return await updatePackage(
          packageId,
          request,
          env,
          corsHeaders
        );
      }

      if (
        path.startsWith(
          "/api/admin/packages/"
        ) &&
        request.method === "DELETE"
      ) {
        const packageId =
          getPathId(
            path,
            "/api/admin/packages/"
          );

        return await deletePackage(
          packageId,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * ADMIN ORDERS
       * =========================================
       */

      if (
        path === "/api/admin/orders" &&
        request.method === "GET"
      ) {
        return await getOrders(
          url,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * ADMIN SLIP
       * =========================================
       */

      if (
        path.startsWith(
          "/api/admin/slip/"
        ) &&
        request.method === "GET"
      ) {
        const orderId =
          getPathId(
            path,
            "/api/admin/slip/"
          );

        return await getSlip(
          orderId,
          env,
          corsHeaders
        );
      }

      /*
       * =========================================
       * OTHER ADMIN ORDER ROUTES
       * =========================================
       */

      const orderRoute =
        parseAdminOrderRoute(path);

      if (
        orderRoute &&
        request.method === "GET" &&
        orderRoute.action === "detail"
      ) {
        return await getAdminOrderDetail(
          orderRoute.orderId,
          env,
          corsHeaders
        );
      }

      if (
        orderRoute &&
        request.method === "POST" &&
        orderRoute.action === "status"
      ) {
        return await updateOrderStatus(
          orderRoute.orderId,
          request,
          env,
          corsHeaders
        );
      }

      if (
        orderRoute &&
        request.method === "POST" &&
        orderRoute.action === "cancel"
      ) {
        return await cancelAdminOrder(
          orderRoute.orderId,
          env,
          corsHeaders
        );
      }

      if (
        orderRoute &&
        request.method === "POST" &&
        orderRoute.action ===
          "reactivate"
      ) {
        return await reactivateAdminOrder(
          orderRoute.orderId,
          env,
          corsHeaders
        );
      }

      if (
        orderRoute &&
        request.method === "POST" &&
        orderRoute.action ===
          "regenerate-code"
      ) {
        return await regenerateAccessCode(
          orderRoute.orderId,
          env,
          corsHeaders
        );
      }

      return errorResponse(
        "Not found",
        404,
        corsHeaders
      );

    } catch (error) {
      console.error(
        "Worker error:",
        error
      );

      return errorResponse(
        "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
        500,
        corsHeaders
      );
    }
  },
};


/*
 * =========================================
 * PUBLIC CONCERTS
 * =========================================
 */

async function getPublicConcerts(
  url,
  env,
  corsHeaders
) {
  const requestedMode =
    cleanText(
      url.searchParams.get("mode")
    ).toLowerCase();

  const mode =
    requestedMode === "replay"
      ? "replay"
      : "live";

  const concertsResult =
    mode === "replay"
      ? await env.DB.prepare(`
          SELECT
            id,
            title,
            description,
            cover_image_url,
            live_starts_at,
            live_ends_at,
            status
          FROM concerts
          WHERE status IN (
            'on_sale',
            'live',
            'ended'
          )
          ORDER BY live_starts_at DESC
        `).all()

      : await env.DB.prepare(`
          SELECT
            id,
            title,
            description,
            cover_image_url,
            live_starts_at,
            live_ends_at,
            status
          FROM concerts
          WHERE status IN (
            'on_sale',
            'live'
          )
          ORDER BY live_starts_at ASC
        `).all();

  const concerts = [];

  for (
    const concert
    of (
      concertsResult.results ||
      []
    )
  ) {
    const sessionsResult =
      await env.DB.prepare(`
        SELECT
          id,
          name,
          live_starts_at,
          live_ends_at,
          sort_order
        FROM concert_sessions
        WHERE
          concert_id = ?
          AND is_active = 1
        ORDER BY
          sort_order ASC,
          live_starts_at ASC
      `)
        .bind(
          concert.id
        )
        .all();

    const packagesResult =
      mode === "replay"

        ? await env.DB.prepare(`
            SELECT
              id,
              name,
              price,
              access_type,
              replay_days,
              replay_months,
              has_ecard,
              video_quality,
              session_selection_mode
            FROM packages
            WHERE
              concert_id = ?
              AND is_active = 1
              AND access_type = 'replay'
            ORDER BY
              price ASC,
              created_at ASC
          `)
            .bind(
              concert.id
            )
            .all()

        : await env.DB.prepare(`
            SELECT
              id,
              name,
              price,
              access_type,
              replay_days,
              replay_months,
              has_ecard,
              video_quality,
              session_selection_mode
            FROM packages
            WHERE
              concert_id = ?
              AND is_active = 1
              AND access_type IN (
                'live',
                'live_replay'
              )
            ORDER BY
              price ASC,
              created_at ASC
          `)
            .bind(
              concert.id
            )
            .all();

    concert.sessions =
      (
        sessionsResult.results ||
        []
      ).map(
        session => ({
          ...session,

          sort_order:
            Number(
              session.sort_order ||
              0
            ),
        })
      );

    concert.packages =
      packagesResult.results ||
      [];

    if (
      concert.packages.length ===
      0
    ) {
      continue;
    }

    for (
      const packageItem
      of concert.packages
    ) {
      const linkedResult =
        await env.DB.prepare(`
          SELECT
            session_id
          FROM package_sessions
          WHERE package_id = ?
          ORDER BY created_at ASC
        `)
          .bind(
            packageItem.id
          )
          .all();

      packageItem.session_ids =
        (
          linkedResult.results ||
          []
        )
          .map(
            item =>
              cleanText(
                item.session_id
              )
          )
          .filter(
            Boolean
          );

      packageItem.price =
        Number(
          packageItem.price ||
          0
        );

      packageItem.replay_days =
        Number(
          packageItem.replay_days ||
          0
        );

      packageItem.replay_months =
        Number(
          packageItem.replay_months ||
          0
        );

      packageItem.has_ecard =
        Number(
          packageItem.has_ecard
        ) === 1
          ? 1
          : 0;

      packageItem.video_quality =
        packageItem.video_quality ||
        "1080p";

      packageItem.session_selection_mode =
        normalizeSessionSelectionMode(
          packageItem
            .session_selection_mode
        ) ||
        "single";

      /*
       * API aliases สำหรับหน้าเว็บลูกค้า
       */

      packageItem.accessType =
        packageItem.access_type;

      packageItem.replayDays =
        packageItem.replay_days;

      packageItem.replayMonths =
        packageItem.replay_months;

      packageItem.hasEcard =
        packageItem.has_ecard === 1;

      packageItem.videoQuality =
        packageItem.video_quality;

      packageItem.sessionIds =
        packageItem.session_ids;

      packageItem.sessionSelectionMode =
        packageItem
          .session_selection_mode;
    }

    concerts.push(
      concert
    );
  }

  return jsonResponse(
    {
      success: true,
      mode,
      concerts,
    },
    200,
    corsHeaders
  );
}

/*
 * =========================================
 * CONCERT COVER
 * =========================================
 */

async function uploadConcertCover(
  request,
  env,
  corsHeaders
) {
  if (!env.SLIPS) {
    return errorResponse(
      "ไม่พบ R2 Storage",
      500,
      corsHeaders
    );
  }

  let formData;

  try {
    formData =
      await request.formData();

  } catch {
    return errorResponse(
      "ข้อมูลอัปโหลดไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const file =
    formData.get("cover") ||
    formData.get("image") ||
    formData.get("file") ||
    formData.get("coverFile") ||
    formData.get("concertCover") ||
    formData.get(
      "concertCoverFile"
    );

  if (
    !(file instanceof File) ||
    file.size === 0
  ) {
    return errorResponse(
      "กรุณาเลือกภาพหน้าปกคอนเสิร์ต",
      400,
      corsHeaders
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    return errorResponse(
      "รองรับเฉพาะ JPG, PNG, WEBP และ GIF",
      400,
      corsHeaders
    );
  }

  if (
    file.size >
    10 * 1024 * 1024
  ) {
    return errorResponse(
      "รูปหน้าปกต้องมีขนาดไม่เกิน 10 MB",
      400,
      corsHeaders
    );
  }

  const extension =
    getImageExtension(
      file.type
    );

  const coverKey =
    "concert-covers/" +
    Date.now() +
    "-" +
    crypto
      .randomUUID()
      .replaceAll(
        "-",
        ""
      )
      .slice(
        0,
        12
      )
      .toLowerCase() +
    "." +
    extension;

  const fileBytes =
    await file.arrayBuffer();

  await env.SLIPS.put(
    coverKey,
    fileBytes,
    {
      httpMetadata: {
        contentType:
          file.type,
      },

      customMetadata: {
        type:
          "concert-cover",

        originalName:
          String(
            file.name ||
            ""
          ).slice(
            0,
            200
          ),

        uploadedAt:
          new Date()
            .toISOString(),
      },
    }
  );

  const coverUrl =
    new URL(
      request.url
    ).origin +
    "/api/concert-cover/" +
    encodeURIComponent(
      coverKey
    );

  return jsonResponse(
    {
      success: true,
      coverKey,
      coverImageUrl:
        coverUrl,
      url:
        coverUrl,
      message:
        "อัปโหลดรูปหน้าปกสำเร็จ",
    },
    201,
    corsHeaders
  );
}


async function getConcertCover(
  coverKey,
  env,
  corsHeaders
) {
  if (!coverKey) {
    return errorResponse(
      "ไม่พบชื่อไฟล์รูป",
      400,
      corsHeaders
    );
  }

  if (
    !coverKey.startsWith(
      "concert-covers/"
    )
  ) {
    return errorResponse(
      "ไม่พบรูปหน้าปก",
      404,
      corsHeaders
    );
  }

  if (!env.SLIPS) {
    return errorResponse(
      "ไม่พบระบบจัดเก็บรูป",
      500,
      corsHeaders
    );
  }

  const object =
    await env.SLIPS.get(
      coverKey
    );

  if (!object) {
    return errorResponse(
      "ไม่พบรูปหน้าปก",
      404,
      corsHeaders
    );
  }

  const headers =
    new Headers();

  object.writeHttpMetadata(
    headers
  );

  headers.set(
    "Content-Type",
    object.httpMetadata
      ?.contentType ||
      "image/jpeg"
  );

  headers.set(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  headers.set(
    "Access-Control-Allow-Origin",
    corsHeaders[
      "Access-Control-Allow-Origin"
    ] ||
    "*"
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  return new Response(
    object.body,
    {
      status: 200,
      headers,
    }
  );
}
/*
 * =========================================
 * SITE ASSETS
 * LOGO / HERO BACKGROUND
 * =========================================
 */

async function getSiteAsset(
  assetKey,
  env,
  corsHeaders
) {
  if (
    !assetKey ||
    !assetKey.startsWith(
      "site-assets/"
    )
  ) {
    return errorResponse(
      "ไม่พบรูปภาพ",
      404,
      corsHeaders
    );
  }

  if (!env.SLIPS) {
    return errorResponse(
      "ไม่พบระบบจัดเก็บรูป",
      500,
      corsHeaders
    );
  }

  const object =
    await env.SLIPS.get(
      assetKey
    );

  if (!object) {
    return errorResponse(
      "ไม่พบรูปภาพ",
      404,
      corsHeaders
    );
  }

  const headers =
    new Headers();

  object.writeHttpMetadata(
    headers
  );

  headers.set(
    "Content-Type",
    object.httpMetadata
      ?.contentType ||
      "image/jpeg"
  );

  headers.set(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  headers.set(
    "Access-Control-Allow-Origin",
    corsHeaders[
      "Access-Control-Allow-Origin"
    ] ||
    "*"
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  return new Response(
    object.body,
    {
      status: 200,
      headers,
    }
  );
}


function getSiteAssetKey(
  path
) {
  return getPathId(
    path,
    "/api/site-asset/"
  );
}

/*
 * =========================================
 * ADMIN CONCERTS
 * =========================================
 */

async function getAdminConcerts(
  env,
  corsHeaders
) {
  const result =
    await env.DB.prepare(`
      SELECT
        c.id,
        c.title,
        c.description,
        c.cover_image_url,
        c.live_starts_at,
        c.live_ends_at,
        c.status,
        c.created_at,
        c.updated_at,

        (
          SELECT COUNT(*)
          FROM concert_sessions s
          WHERE s.concert_id = c.id
        ) AS session_count,

        (
          SELECT COUNT(*)
          FROM packages p
          WHERE p.concert_id = c.id
        ) AS package_count

      FROM concerts c

      ORDER BY
        c.created_at DESC
    `).all();

  const concerts =
    result.results ||
    [];

  for (
    const concert
    of concerts
  ) {
    concert.session_count =
      Number(
        concert.session_count ||
        0
      );

    concert.package_count =
      Number(
        concert.package_count ||
        0
      );
  }

  return jsonResponse(
    {
      success: true,
      concerts,
    },
    200,
    corsHeaders
  );
}


async function createConcert(
  request,
  env,
  corsHeaders
) {
  const input =
    normalizeConcertInput(
      await readJson(
        request
      )
    );

  const validationError =
    validateConcertInput(
      input
    );

  if (
    validationError
  ) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  const concertId =
    createId(
      "CON"
    );

  const now =
    new Date()
      .toISOString();

  await env.DB.prepare(`
    INSERT INTO concerts (
      id,
      title,
      description,
      cover_image_url,
      live_starts_at,
      live_ends_at,
      status,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)
    .bind(
      concertId,
      input.title,
      input.description,
      input.coverImageUrl,
      input.liveStartsAt,
      input.liveEndsAt,
      input.status,
      now,
      now
    )
    .run();

  return jsonResponse(
    {
      success: true,
      concertId,
      message:
        "สร้างคอนเสิร์ตสำเร็จ",
    },
    201,
    corsHeaders
  );
}


async function updateConcert(
  concertId,
  request,
  env,
  corsHeaders
) {
  if (!concertId) {
    return errorResponse(
      "ไม่พบรหัสคอนเสิร์ต",
      400,
      corsHeaders
    );
  }

  const existing =
    await env.DB.prepare(`
      SELECT id
      FROM concerts
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        concertId
      )
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบคอนเสิร์ต",
      404,
      corsHeaders
    );
  }

  const input =
    normalizeConcertInput(
      await readJson(
        request
      )
    );

  const validationError =
    validateConcertInput(
      input
    );

  if (
    validationError
  ) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    UPDATE concerts
    SET
      title = ?,
      description = ?,
      cover_image_url = ?,
      live_starts_at = ?,
      live_ends_at = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      input.title,
      input.description,
      input.coverImageUrl,
      input.liveStartsAt,
      input.liveEndsAt,
      input.status,
      new Date()
        .toISOString(),
      concertId
    )
    .run();

  return jsonResponse(
    {
      success: true,
      concertId,
      message:
        "แก้ไขคอนเสิร์ตสำเร็จ",
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * CONCERT SESSIONS
 * =========================================
 */

async function getSessions(
  url,
  env,
  corsHeaders
) {
  const concertId =
    cleanText(
      url.searchParams.get(
        "concertId"
      ) ||
      url.searchParams.get(
        "concert_id"
      )
    );

  if (!concertId) {
    return errorResponse(
      "ไม่พบรหัสคอนเสิร์ต",
      400,
      corsHeaders
    );
  }

  const result =
    await env.DB.prepare(`
      SELECT
        id,
        concert_id,
        name,
        live_starts_at,
        live_ends_at,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM concert_sessions
      WHERE concert_id = ?
      ORDER BY
        sort_order ASC,
        live_starts_at ASC
    `)
      .bind(
        concertId
      )
      .all();

  const sessions =
    result.results ||
    [];

  for (
    const session
    of sessions
  ) {
    session.sort_order =
      Number(
        session.sort_order ||
        0
      );

    session.is_active =
      Number(
        session.is_active
      ) === 1
        ? 1
        : 0;
  }

  return jsonResponse(
    {
      success: true,
      sessions,
    },
    200,
    corsHeaders
  );
}


async function createSession(
  request,
  env,
  corsHeaders
) {
  const input =
    normalizeSessionInput(
      await readJson(
        request
      )
    );

  const validationError =
    validateSessionInput(
      input
    );

  if (
    validationError
  ) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  const concert =
    await env.DB.prepare(`
      SELECT id
      FROM concerts
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        input.concertId
      )
      .first();

  if (!concert) {
    return errorResponse(
      "ไม่พบคอนเสิร์ต",
      404,
      corsHeaders
    );
  }

  const sessionId =
    createId(
      "DAY"
    );

  const now =
    new Date()
      .toISOString();

  await env.DB.prepare(`
    INSERT INTO concert_sessions (
      id,
      concert_id,
      name,
      live_starts_at,
      live_ends_at,
      sort_order,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)
    .bind(
      sessionId,
      input.concertId,
      input.name,
      input.liveStartsAt,
      input.liveEndsAt,
      input.sortOrder,
      input.isActive,
      now,
      now
    )
    .run();

  await updateConcertTimeRange(
    input.concertId,
    env
  );

  return jsonResponse(
    {
      success: true,
      sessionId,
      message:
        "เพิ่มวันแสดงสำเร็จ",
    },
    201,
    corsHeaders
  );
}


async function updateSession(
  sessionId,
  request,
  env,
  corsHeaders
) {
  if (!sessionId) {
    return errorResponse(
      "ไม่พบรหัสวันแสดง",
      400,
      corsHeaders
    );
  }

  const existing =
    await env.DB.prepare(`
      SELECT
        id,
        concert_id
      FROM concert_sessions
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        sessionId
      )
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบวันแสดง",
      404,
      corsHeaders
    );
  }

  const input =
    normalizeSessionInput({
      ...(
        await readJson(
          request
        )
      ),

      concertId:
        existing.concert_id,
    });

  const validationError =
    validateSessionInput(
      input
    );

  if (
    validationError
  ) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    UPDATE concert_sessions
    SET
      name = ?,
      live_starts_at = ?,
      live_ends_at = ?,
      sort_order = ?,
      is_active = ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      input.name,
      input.liveStartsAt,
      input.liveEndsAt,
      input.sortOrder,
      input.isActive,
      new Date()
        .toISOString(),
      sessionId
    )
    .run();

  await updateConcertTimeRange(
    existing.concert_id,
    env
  );

  return jsonResponse(
    {
      success: true,
      sessionId,
      message:
        "แก้ไขวันแสดงสำเร็จ",
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * PACKAGES
 * =========================================
 */

async function getPackages(
  url,
  env,
  corsHeaders
) {
  const concertId =
    cleanText(
      url.searchParams.get(
        "concertId"
      ) ||
      url.searchParams.get(
        "concert_id"
      )
    );

  const result =
    concertId

      ? await env.DB.prepare(`
          SELECT
            id,
            concert_id,
            name,
            price,
            access_type,
            replay_days,
            replay_months,
            has_ecard,
            video_quality,
            session_selection_mode,
            is_active,
            created_at,
            updated_at
          FROM packages
          WHERE concert_id = ?
          ORDER BY created_at ASC
        `)
          .bind(
            concertId
          )
          .all()

      : await env.DB.prepare(`
          SELECT
            id,
            concert_id,
            name,
            price,
            access_type,
            replay_days,
            replay_months,
            has_ecard,
            video_quality,
            session_selection_mode,
            is_active,
            created_at,
            updated_at
          FROM packages
          ORDER BY created_at DESC
        `).all();

  const packages =
    result.results ||
    [];

  for (
    const packageItem
    of packages
  ) {
    const linkedResult =
      await env.DB.prepare(`
        SELECT
          session_id
        FROM package_sessions
        WHERE package_id = ?
        ORDER BY created_at ASC
      `)
        .bind(
          packageItem.id
        )
        .all();

    packageItem.session_ids =
      (
        linkedResult.results ||
        []
      )
        .map(
          item =>
            cleanText(
              item.session_id
            )
        )
        .filter(
          Boolean
        );

    packageItem.price =
      Number(
        packageItem.price ||
        0
      );

    packageItem.replay_days =
      Number(
        packageItem.replay_days ||
        0
      );

    packageItem.replay_months =
      Number(
        packageItem.replay_months ||
        0
      );

    packageItem.has_ecard =
      Number(
        packageItem.has_ecard
      ) === 1
        ? 1
        : 0;

    packageItem.is_active =
      Number(
        packageItem.is_active
      ) === 1
        ? 1
        : 0;

    packageItem.video_quality =
      packageItem.video_quality ||
      "1080p";

    packageItem.session_selection_mode =
      normalizeSessionSelectionMode(
        packageItem
          .session_selection_mode
      ) ||
      "single";

    packageItem.sessionSelectionMode =
      packageItem
        .session_selection_mode;
  }

  return jsonResponse(
    {
      success: true,
      packages,
    },
    200,
    corsHeaders
  );
}


async function createPackage(
  request,
  env,
  corsHeaders
) {
  const input =
    normalizePackageInput(
      await readJson(
        request
      )
    );

  const validationError =
    validatePackageInput(
      input
    );

  if (
    validationError
  ) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  if (
    input.sessionIds.length ===
    0
  ) {
    return errorResponse(
      input.accessType ===
        "replay"
        ? "กรุณาเลือกวันที่สามารถรับชม REPLAY อย่างน้อย 1 วัน"
        : "กรุณาเลือกวันแสดงอย่างน้อย 1 วัน",
      400,
      corsHeaders
    );
  }

  const concert =
    await env.DB.prepare(`
      SELECT id
      FROM concerts
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        input.concertId
      )
      .first();

  if (!concert) {
    return errorResponse(
      "ไม่พบคอนเสิร์ต",
      404,
      corsHeaders
    );
  }

  const sessionsValid =
    await validateSessionsForConcert(
      input.concertId,
      input.sessionIds,
      env
    );

  if (
    !sessionsValid
  ) {
    return errorResponse(
      "มีวันแสดงที่ไม่ได้อยู่ในคอนเสิร์ตนี้",
      400,
      corsHeaders
    );
  }

  const packageId =
    createId(
      "PKG"
    );

  const now =
    new Date()
      .toISOString();

  await env.DB.prepare(`
    INSERT INTO packages (
      id,
      concert_id,
      name,
      price,
      access_type,
      replay_days,
      replay_months,
      has_ecard,
      video_quality,
      session_selection_mode,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)
    .bind(
      packageId,
      input.concertId,
      input.name,
      input.price,
      input.accessType,
      input.replayDays,
      input.replayMonths,
      input.hasEcard,
      input.videoQuality,
      input.sessionSelectionMode,
      input.isActive,
      now,
      now
    )
    .run();

  try {
    await replacePackageSessions(
      packageId,
      input.sessionIds,
      env
    );

  } catch (error) {
    await env.DB.prepare(`
      DELETE FROM packages
      WHERE id = ?
    `)
      .bind(
        packageId
      )
      .run();

    throw error;
  }

  return jsonResponse(
    {
      success: true,

      packageId,

      package: {
        id:
          packageId,

        concertId:
          input.concertId,

        name:
          input.name,

        price:
          input.price,

        accessType:
          input.accessType,

        replayDays:
          input.replayDays,

        replayMonths:
          input.replayMonths,

        hasEcard:
          input.hasEcard,

        videoQuality:
          input.videoQuality,

        sessionIds:
          input.sessionIds,

        sessionSelectionMode:
          input.sessionSelectionMode,

        isActive:
          input.isActive,
      },

      message:
        "เพิ่มแพ็กเกจสำเร็จ",
    },
    201,
    corsHeaders
  );
}

async function updatePackage(
  packageId,
  request,
  env,
  corsHeaders
) {
  if (!packageId) {
    return errorResponse(
      "ไม่พบรหัสแพ็กเกจ",
      400,
      corsHeaders
    );
  }

  const existing =
    await env.DB.prepare(`
      SELECT
        id,
        concert_id,
        session_selection_mode
      FROM packages
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        packageId
      )
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบแพ็กเกจ",
      404,
      corsHeaders
    );
  }

  const body =
    await readJson(
      request
    );

  /*
   * ถ้าหน้า Admin รุ่นเก่ายังไม่ได้ส่ง
   * sessionSelectionMode มา
   * ให้คงค่าของเดิมเอาไว้
   */
  if (
    body.sessionSelectionMode ===
      undefined &&
    body.session_selection_mode ===
      undefined
  ) {
    body.sessionSelectionMode =
      existing
        .session_selection_mode ||
      "single";
  }

  const input =
    normalizePackageInput({
      ...body,

      concertId:
        existing.concert_id,
    });

  if (
    input.accessType ===
    "live"
  ) {
    input.replayDays =
      0;

    input.replayMonths =
      0;
  }

  const validationError =
    validatePackageInput(
      input
    );

  if (
    validationError
  ) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  if (
    input.sessionIds.length ===
    0
  ) {
    return errorResponse(
      input.accessType ===
        "replay"
        ? "กรุณาเลือกวันที่สามารถรับชม REPLAY อย่างน้อย 1 วัน"
        : "กรุณาเลือกวันแสดงอย่างน้อย 1 วัน",
      400,
      corsHeaders
    );
  }

  const sessionsValid =
    await validateSessionsForConcert(
      existing.concert_id,
      input.sessionIds,
      env
    );

  if (
    !sessionsValid
  ) {
    return errorResponse(
      "มีวันแสดงที่ไม่ได้อยู่ในคอนเสิร์ตนี้",
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    UPDATE packages
    SET
      name = ?,
      price = ?,
      access_type = ?,
      replay_days = ?,
      replay_months = ?,
      has_ecard = ?,
      video_quality = ?,
      session_selection_mode = ?,
      is_active = ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      input.name,
      input.price,
      input.accessType,
      input.replayDays,
      input.replayMonths,
      input.hasEcard,
      input.videoQuality,
      input.sessionSelectionMode,
      input.isActive,
      new Date()
        .toISOString(),
      packageId
    )
    .run();

  await replacePackageSessions(
    packageId,
    input.sessionIds,
    env
  );

  return jsonResponse(
    {
      success: true,

      packageId,

      package: {
        id:
          packageId,

        concertId:
          existing.concert_id,

        name:
          input.name,

        price:
          input.price,

        accessType:
          input.accessType,

        replayDays:
          input.replayDays,

        replayMonths:
          input.replayMonths,

        hasEcard:
          input.hasEcard,

        videoQuality:
          input.videoQuality,

        sessionIds:
          input.sessionIds,

        sessionSelectionMode:
          input.sessionSelectionMode,

        isActive:
          input.isActive,
      },

      message:
        "แก้ไขแพ็กเกจสำเร็จ",
    },
    200,
    corsHeaders
  );
}


async function deletePackage(
  packageId,
  env,
  corsHeaders
) {
  if (!packageId) {
    return errorResponse(
      "ไม่พบรหัสแพ็กเกจ",
      400,
      corsHeaders
    );
  }

  const existing =
    await env.DB.prepare(`
      SELECT
        id,
        name
      FROM packages
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        packageId
      )
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบแพ็กเกจ",
      404,
      corsHeaders
    );
  }

  const orderCount =
    await env.DB.prepare(`
      SELECT
        COUNT(*) AS total
      FROM orders
      WHERE package_id = ?
    `)
      .bind(
        packageId
      )
      .first();

  if (
    Number(
      orderCount?.total ||
      0
    ) > 0
  ) {
    return errorResponse(
      "ไม่สามารถลบแพ็กเกจนี้ได้ เพราะมีรายการสั่งซื้ออยู่แล้ว ให้ปิดขายแทน",
      409,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    DELETE FROM package_sessions
    WHERE package_id = ?
  `)
    .bind(
      packageId
    )
    .run();

  await env.DB.prepare(`
    DELETE FROM packages
    WHERE id = ?
  `)
    .bind(
      packageId
    )
    .run();

  return jsonResponse(
    {
      success: true,
      packageId,

      message:
        "ลบแพ็กเกจ " +
        existing.name +
        " สำเร็จ",
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * PAYMENT
 * EASYSLIP
 * LINE
 * =========================================
 */

async function createPayment(
  request,
  env,
  corsHeaders
) {
  if (
    !env.EASYSLIP_API_KEY
  ) {
    return errorResponse(
      "ระบบตรวจสลิปยังไม่ได้ตั้งค่า EASYSLIP_API_KEY",
      500,
      corsHeaders
    );
  }

  if (!env.SLIPS) {
    return errorResponse(
      "ไม่พบระบบจัดเก็บสลิป",
      500,
      corsHeaders
    );
  }

  let formData;

  try {
    formData =
      await request.formData();

  } catch {
    return errorResponse(
      "ข้อมูลการชำระเงินไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const packageId =
    cleanText(
      formData.get(
        "packageId"
      ) ??
      formData.get(
        "package_id"
      )
    );

  const sessionId =
    cleanText(
      formData.get(
        "sessionId"
      ) ??
      formData.get(
        "session_id"
      )
    );

  const priceValue =
    formData.get(
      "price"
    );

  const submittedPrice =
    Number(
      priceValue
    );

  const slip =
    formData.get(
      "slip"
    );

  const lineLinkToken =
    cleanText(
      formData.get(
        "lineLinkToken"
      ) ??
      formData.get(
        "line_link_token"
      )
    );

  let lineUserId =
    "";

  /*
   * =========================================
   * LINE LINK
   * =========================================
   */

  if (
    lineLinkToken
  ) {
    const lineLinkResult =
      await verifyLineLinkToken(
        lineLinkToken,
        env
      );

    if (
      !lineLinkResult.ok
    ) {
      return errorResponse(
        lineLinkResult.message,
        400,
        corsHeaders
      );
    }

    lineUserId =
      lineLinkResult.lineUserId;
  }

  /*
   * =========================================
   * BASIC VALIDATION
   * =========================================
   */

  if (!packageId) {
    return errorResponse(
      "กรุณาเลือกแพ็กเกจ",
      400,
      corsHeaders
    );
  }

  if (
    priceValue === null ||
    priceValue === ""
  ) {
    return errorResponse(
      "ไม่พบราคาแพ็กเกจ",
      400,
      corsHeaders
    );
  }

  const slipError =
    validateSlip(
      slip
    );

  if (
    slipError
  ) {
    return errorResponse(
      slipError,
      400,
      corsHeaders
    );
  }

  /*
   * =========================================
   * PACKAGE
   * =========================================
   */

  const selectedPackage =
    await env.DB.prepare(`
      SELECT
        p.id,
        p.concert_id,
        p.name,
        p.price,
        p.access_type,
        p.replay_days,
        p.replay_months,
        p.has_ecard,
        p.video_quality,
        p.session_selection_mode,
        p.is_active,

        c.status
          AS concert_status

      FROM packages p

      INNER JOIN concerts c
        ON c.id =
          p.concert_id

      WHERE p.id = ?
      LIMIT 1
    `)
      .bind(
        packageId
      )
      .first();

  if (
    !selectedPackage
  ) {
    return errorResponse(
      "ไม่พบแพ็กเกจที่เลือก",
      404,
      corsHeaders
    );
  }

  if (
    Number(
      selectedPackage.is_active
    ) !== 1
  ) {
    return errorResponse(
      "แพ็กเกจนี้ไม่เปิดขาย",
      400,
      corsHeaders
    );
  }

  const accessType =
    normalizeAccessType(
      selectedPackage
        .access_type
    );

  const isReplayOnly =
    accessType ===
    "replay";

  const sessionSelectionMode =
    normalizeSessionSelectionMode(
      selectedPackage
        .session_selection_mode
    ) ||
    "single";

  const allowedConcertStatuses =
    isReplayOnly
      ? [
          "on_sale",
          "live",
          "ended",
        ]
      : [
          "on_sale",
          "live",
        ];

  if (
    !allowedConcertStatuses
      .includes(
        selectedPackage
          .concert_status
      )
  ) {
    return errorResponse(
      isReplayOnly
        ? "รีเพลย์นี้ยังไม่เปิดขาย"
        : "คอนเสิร์ตนี้ยังไม่เปิดขาย",
      400,
      corsHeaders
    );
  }

  /*
   * =========================================
   * PRICE
   * =========================================
   */

  if (
    !Number.isFinite(
      submittedPrice
    ) ||
    Number(
      selectedPackage.price
    ) !==
    submittedPrice
  ) {
    return errorResponse(
      "ราคาแพ็กเกจไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  /*
   * =========================================
   * AVAILABLE SESSIONS
   * =========================================
   */

  const availableSessions =
    await getPackageEntitledSessions(
      packageId,
      selectedPackage
        .concert_id,
      env
    );

  if (
    availableSessions.length ===
    0
  ) {
    return errorResponse(
      isReplayOnly
        ? "แพ็กเกจ REPLAY นี้ยังไม่ได้กำหนดวันที่รับชม"
        : "แพ็กเกจนี้ยังไม่ได้กำหนดวันแสดง",
      400,
      corsHeaders
    );
  }

  let selectedSession =
    null;

  let entitledSessions =
    [];

  /*
   * =========================================
   * SINGLE
   *
   * Admin สามารถผูก 15 + 16 ได้
   * แต่ลูกค้าต้องเลือกเองเพียง 1 วัน
   * =========================================
   */

  if (
    sessionSelectionMode ===
    "single"
  ) {
    if (
      !sessionId
    ) {
      return errorResponse(
        isReplayOnly
          ? "กรุณาเลือกวันที่ต้องการรับชม REPLAY"
          : "กรุณาเลือกวันแสดง",
        400,
        corsHeaders
      );
    }

    selectedSession =
      availableSessions.find(
        session =>
          cleanText(
            session.id
          ) ===
          sessionId
      ) ||
      null;

    if (
      !selectedSession
    ) {
      return errorResponse(
        isReplayOnly
          ? "วันที่เลือกไม่อยู่ในสิทธิ์ของแพ็กเกจ REPLAY นี้"
          : "วันแสดงที่เลือกไม่อยู่ในสิทธิ์ของแพ็กเกจนี้",
        400,
        corsHeaders
      );
    }

    entitledSessions = [
      selectedSession,
    ];
  }

  /*
   * =========================================
   * ALL
   *
   * ลูกค้าไม่ต้องเลือกวัน
   * ได้ทุก session ที่ Admin ผูกไว้
   * =========================================
   */

  if (
    sessionSelectionMode ===
    "all"
  ) {
    entitledSessions =
      availableSessions;

    selectedSession =
      null;
  }

  /*
   * =========================================
   * ORDER ID
   * =========================================
   */

  const orderId =
    createId(
      "LH"
    );

  /*
   * =========================================
   * EASYSLIP
   * =========================================
   */

  let easySlip;

  try {
    easySlip =
      await verifySlipWithEasySlip(
        slip,
        orderId,
        Number(
          selectedPackage.price
        ),
        env
      );

  } catch (error) {
    return errorResponse(
      error?.message ||
      "ตรวจสอบสลิปไม่สำเร็จ",

      normalizeEasySlipHttpStatus(
        error
      ),

      corsHeaders
    );
  }

  if (
    !easySlip
      .matchedAccountMatched
  ) {
    return errorResponse(
      "บัญชีผู้รับเงินในสลิปไม่ตรงกับบัญชีรับเงินที่ตั้งไว้ใน EasySlip กรุณาตรวจสอบ QR และลองใหม่อีกครั้ง",
      400,
      corsHeaders
    );
  }

  if (
    easySlip.isDuplicate
  ) {
    return errorResponse(
      "สลิปนี้เคยถูกใช้แล้ว กรุณาใช้สลิปใหม่",
      409,
      corsHeaders
    );
  }

  if (
    !easySlip
      .isAmountMatched
  ) {
    return errorResponse(
      "ยอดเงินในสลิป " +
      Number(
        easySlip
          .amountInSlip ||
        0
      ).toLocaleString(
        "th-TH"
      ) +
      " บาท ไม่ตรงกับราคาแพ็กเกจ " +
      Number(
        selectedPackage.price
      ).toLocaleString(
        "th-TH"
      ) +
      " บาท",
      400,
      corsHeaders
    );
  }

  if (
    !easySlip.transRef
  ) {
    return errorResponse(
      "ไม่พบเลขอ้างอิงธุรกรรมในสลิป",
      400,
      corsHeaders
    );
  }

  /*
   * =========================================
   * DUPLICATE D1
   * =========================================
   */

  const usedSlip =
    await env.DB.prepare(`
      SELECT id
      FROM orders
      WHERE easyslip_trans_ref = ?
      LIMIT 1
    `)
      .bind(
        easySlip.transRef
      )
      .first();

  if (
    usedSlip
  ) {
    return errorResponse(
      "สลิปนี้เคยถูกใช้สร้างคำสั่งซื้อแล้ว",
      409,
      corsHeaders
    );
  }

  /*
   * =========================================
   * ORDER SNAPSHOT
   * =========================================
   */

  const now =
    new Date()
      .toISOString();

  const entitledFinalSessionEnd =
  entitledSessions
    .map(
      session =>
        session.live_ends_at
    )
    .filter(Boolean)
    .sort()
    .at(-1) ||
  null;


const orderSnapshot = {
  id:
    orderId,

  concert_id:
    selectedPackage
      .concert_id,

  package_id:
    selectedPackage.id,

  package_name:
    selectedPackage.name,

  access_type:
    accessType,

  replay_days:
    Number(
      selectedPackage
        .replay_days ||
      0
    ),

  replay_months:
    Number(
      selectedPackage
        .replay_months ||
      0
    ),

  has_ecard:
    Number(
      selectedPackage
        .has_ecard ||
      0
    ),

  video_quality:
    selectedPackage
      .video_quality ||
    "1080p",

  selected_session_id:
    selectedSession?.id ||
    null,

  selected_session_name:
    selectedSession?.name ||
    null,

  selected_session_starts_at:
    selectedSession
      ?.live_starts_at ||
    null,

  selected_session_ends_at:
    selectedSession
      ?.live_ends_at ||
    entitledFinalSessionEnd ||
    null,

  approved_at:
    now,
};

  /*
   * =========================================
   * EXPIRY
   * =========================================
   */

  const accessExpiresAt =
    await calculateAccessExpiry(
      orderSnapshot,
      env
    );

  if (
    !accessExpiresAt
  ) {
    return errorResponse(
      "ไม่สามารถคำนวณวันหมดอายุสิทธิ์ได้",
      400,
      corsHeaders
    );
  }

  const accessCode =
    createAccessCode();

  /*
   * =========================================
   * R2 SLIP
   * =========================================
   */

  const extension =
    getImageExtension(
      slip.type
    );

  const slipKey =
    "slips/" +
    orderId +
    "." +
    extension;

  const slipBytes =
    await slip.arrayBuffer();

  await env.SLIPS.put(
    slipKey,
    slipBytes,
    {
      httpMetadata: {
        contentType:
          slip.type,
      },

      customMetadata: {
        orderId,

        packageId:
          selectedPackage.id,

        sessionSelectionMode,

        sessionId:
          selectedSession?.id ||
          "",

        sessionIds:
          entitledSessions
            .map(
              session =>
                session.id
            )
            .join(","),

        price:
          String(
            selectedPackage.price
          ),

        transRef:
          easySlip.transRef,

        matchedAccount:
          String(
            easySlip
              .matchedAccountMatched
          ),

        matchedBankNumber:
          cleanText(
            easySlip
              .matchedAccount
              ?.bankNumber ||
            ""
          ),
      },
    }
  );

  /*
   * =========================================
   * INSERT ORDER
   * =========================================
   */

  try {
    await env.DB.prepare(`
      INSERT INTO orders (
        id,
        package_number,
        price,
        slip_key,
        status,
        created_at,

        concert_id,
        package_id,
        package_name,
        access_type,
        replay_days,
        replay_months,
        has_ecard,
        video_quality,

        selected_session_id,
        selected_session_name,
        selected_session_starts_at,
        selected_session_ends_at,

        access_code,
        approved_at,
        access_expires_at,

        easyslip_trans_ref,
        easyslip_verified_at,
        easyslip_amount,
        easyslip_receiver_name,
        easyslip_sender_name,
        easyslip_status,
        easyslip_message
      )

      VALUES (
        ?, ?, ?, ?, 'approved', ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `)
      .bind(
        orderId,
        packageId,

        Number(
          selectedPackage.price
        ),

        slipKey,
        now,

        orderSnapshot
          .concert_id,

        orderSnapshot
          .package_id,

        orderSnapshot
          .package_name,

        orderSnapshot
          .access_type,

        orderSnapshot
          .replay_days,

        orderSnapshot
          .replay_months,

        orderSnapshot
          .has_ecard,

        orderSnapshot
          .video_quality,

        orderSnapshot
          .selected_session_id,

        orderSnapshot
          .selected_session_name,

        orderSnapshot
          .selected_session_starts_at,

        orderSnapshot
          .selected_session_ends_at,

        accessCode,
        now,
        accessExpiresAt,

        easySlip.transRef,
        now,
        easySlip.amountInSlip,
        easySlip.receiverName,
        easySlip.senderName,
        "verified",
        easySlip.message
      )
      .run();

  } catch (
    databaseError
  ) {
    await env.SLIPS.delete(
      slipKey
    );

    const errorText =
      String(
        databaseError
          ?.message ||
        ""
      ).toLowerCase();

    if (
      errorText.includes(
        "easyslip_trans_ref"
      ) ||
      errorText.includes(
        "unique"
      )
    ) {
      return errorResponse(
        "สลิปนี้เคยถูกใช้สร้างคำสั่งซื้อแล้ว",
        409,
        corsHeaders
      );
    }

    throw databaseError;
  }

  /*
   * =========================================
   * SNAPSHOT ACTUAL RIGHTS
   * =========================================
   */

  try {
    await saveOrderSessionSnapshots(
      orderId,
      entitledSessions,
      env
    );

  } catch (
    snapshotError
  ) {
    console.error(
      "Save order session snapshots failed:",
      snapshotError
    );

    try {
      await env.DB.prepare(`
        DELETE FROM order_sessions
        WHERE order_id = ?
      `)
        .bind(
          orderId
        )
        .run();

      await env.DB.prepare(`
        DELETE FROM orders
        WHERE id = ?
      `)
        .bind(
          orderId
        )
        .run();

      await env.SLIPS.delete(
        slipKey
      );

    } catch (
      cleanupError
    ) {
      console.error(
        "Order snapshot cleanup failed:",
        cleanupError
      );
    }

    throw snapshotError;
  }

  /*
   * =========================================
   * LINE
   * =========================================
   */

  let lineNotificationSent =
    false;

  if (
    lineUserId
  ) {
    const linkedAt =
      new Date()
        .toISOString();

    await env.DB.prepare(`
      INSERT INTO line_users (
        line_user_id,
        order_id,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?
      )

      ON CONFLICT(line_user_id)
      DO UPDATE SET
        order_id =
          excluded.order_id,
        updated_at =
          excluded.updated_at
    `)
      .bind(
        lineUserId,
        orderId,
        linkedAt,
        linkedAt
      )
      .run();

    try {
      await pushApprovedOrderToLine(
        lineUserId,
        {
          orderId,
          accessCode,
          accessExpiresAt,

          packageName:
            selectedPackage.name,

          accessType,

          sessionSelectionMode,

          sessionName:
            selectedSession?.name ||
            "",

          sessionNames:
            entitledSessions
              .map(
                session =>
                  session.name
              )
              .filter(
                Boolean
              ),

          liveStartsAt:
            selectedSession
              ?.live_starts_at ||
            null,

          concertId:
            selectedPackage
              .concert_id,
        },
        env
      );

      lineNotificationSent =
        true;

    } catch (
      lineError
    ) {
      console.error(
        "LINE access code push failed:",
        lineError?.message ||
        String(
          lineError
        )
      );
    }
  }

  /*
   * =========================================
   * RESPONSE
   * =========================================
   */

  return jsonResponse(
    {
      success: true,

      orderId,

      status:
        "approved",

      automaticApproval:
        true,

      accessCode,

      approvedAt:
        now,

      accessExpiresAt,

      lineLinked:
        Boolean(
          lineUserId
        ),

      lineNotificationSent,

      sessionSelectionMode,

      selectedSession:
        selectedSession
          ? {
              id:
                selectedSession.id,

              name:
                selectedSession.name,

              liveStartsAt:
                selectedSession
                  .live_starts_at,

              liveEndsAt:
                selectedSession
                  .live_ends_at,
            }
          : null,

      entitledSessions:
        entitledSessions.map(
          session => ({
            id:
              session.id,

            name:
              session.name ||
              "",

            liveStartsAt:
              session
                .live_starts_at ||
              null,

            liveEndsAt:
              session
                .live_ends_at ||
              null,
          })
        ),

      package: {
        id:
          selectedPackage.id,

        name:
          selectedPackage.name,

        price:
          Number(
            selectedPackage.price
          ),

        accessType,

        sessionSelectionMode,

        replayDays:
          Number(
            selectedPackage
              .replay_days ||
            0
          ),

        replayMonths:
          Number(
            selectedPackage
              .replay_months ||
            0
          ),

        hasEcard:
          Number(
            selectedPackage
              .has_ecard ||
            0
          ) === 1,

        videoQuality:
          selectedPackage
            .video_quality ||
          "1080p",
      },

      verification: {
        matchedAccount:
          easySlip
            .matchedAccountMatched,

        matchedAccountDetail:
          easySlip
            .matchedAccount,

        amount:
          easySlip
            .amountInSlip,

        transRef:
          easySlip.transRef,

        senderName:
          easySlip.senderName,

        receiverName:
          easySlip.receiverName,
      },

      message:
        lineNotificationSent
          ? "ตรวจสอบสลิป บัญชีรับเงิน และยอดเงินถูกต้อง อนุมัติสำเร็จ และส่งรหัสเข้าชมทาง LINE แล้ว"
          : "ตรวจสอบสลิป บัญชีรับเงิน และยอดเงินถูกต้อง อนุมัติสำเร็จ กรุณาเก็บรหัสเข้าชมไว้",
    },
    201,
    corsHeaders
  );
}

/*
 * =========================================
 * EASYSLIP V2
 * =========================================
 */

async function verifySlipWithEasySlip(
  slip,
  orderId,
  expectedAmount,
  env
) {
  const easySlipForm =
    new FormData();

  easySlipForm.append(
    "image",
    slip,
    slip.name ||
    "slip.jpg"
  );

  easySlipForm.append(
    "remark",
    orderId
  );

  easySlipForm.append(
    "matchAccount",
    "true"
  );

  easySlipForm.append(
    "matchAmount",
    String(
      expectedAmount
    )
  );

  easySlipForm.append(
    "checkDuplicate",
    "true"
  );

  let response;

  try {
    response =
      await fetch(
        "https://api.easyslip.com/v2/verify/bank",
        {
          method:
            "POST",

          headers: {
            Authorization:
              "Bearer " +
              env.EASYSLIP_API_KEY,
          },

          body:
            easySlipForm,
        }
      );

  } catch {
    const error =
      new Error(
        "ไม่สามารถเชื่อมต่อ EasySlip ได้ กรุณาลองใหม่อีกครั้ง"
      );

    error.status =
      502;

    throw error;
  }

  let result;

  try {
    result =
      await response.json();

  } catch {
    const error =
      new Error(
        "EasySlip ส่งข้อมูลตอบกลับไม่ถูกต้อง"
      );

    error.status =
      502;

    throw error;
  }

  if (
    !response.ok ||
    !result?.success
  ) {
    const code =
      cleanText(
        result?.error?.code
      );

    const apiMessage =
      cleanText(
        result?.error?.message
      );

    const messages = {
      MISSING_API_KEY:
        "ไม่พบ EASYSLIP_API_KEY ในระบบ",

      INVALID_API_KEY:
        "EASYSLIP_API_KEY ไม่ถูกต้องหรือหมดอายุ",

      BRANCH_INACTIVE:
        "สาขา EasySlip ถูกปิดใช้งาน",

      SERVICE_BANNED:
        "บริการ EasySlip ถูกระงับ กรุณาติดต่อ EasySlip",

      SERVICE_DELETED:
        "ไม่พบบริการ EasySlip ที่เชื่อมต่อไว้",

      IP_NOT_ALLOWED:
        "IP ของระบบไม่ได้รับอนุญาตใน EasySlip",

      QUOTA_EXCEEDED:
        "โควตาตรวจสลิป EasySlip หมดแล้ว",

      VALIDATION_ERROR:
        "ข้อมูลที่ส่งไปตรวจสอบไม่ถูกต้อง",

      IMAGE_SIZE_TOO_LARGE:
        "ภาพสลิปมีขนาดเกิน 4 MB",

      INVALID_IMAGE_TYPE:
        "ไฟล์ที่ส่งไปไม่ใช่รูปภาพที่รองรับ",

      INVALID_IMAGE_FORMAT:
        "รูปแบบไฟล์สลิปไม่ถูกต้อง",

      SLIP_NOT_FOUND:
        "ไม่พบ QR Code หรือไม่สามารถตรวจสอบสลิปนี้ได้",

      SLIP_PENDING:
        "ธนาคารยังประมวลผลสลิปไม่เสร็จ กรุณารอสักครู่แล้วลองใหม่",

      API_SERVER_ERROR:
        "ระบบธนาคารหรือ EasySlip ขัดข้องชั่วคราว กรุณาลองใหม่",

      INTERNAL_SERVER_ERROR:
        "EasySlip ขัดข้องชั่วคราว กรุณาลองใหม่",

      ACCOUNT_NOT_MATCHED:
        "บัญชีผู้รับเงินในสลิปไม่ตรงกับบัญชีที่ตั้งไว้ใน EasySlip",

      AMOUNT_NOT_MATCHED:
        "ยอดเงินในสลิปไม่ตรงกับราคาที่ต้องชำระ",

      DUPLICATE_SLIP:
        "สลิปนี้เคยถูกใช้แล้ว",
    };

    const error =
      new Error(
        messages[code] ||
        apiMessage ||
        "ตรวจสอบสลิปไม่สำเร็จ"
      );

    error.code =
      code;

    error.status =
      response.status;

    throw error;
  }

  const data =
    result.data ||
    {};

  const rawSlip =
    data.rawSlip ||
    {};

  const amountInSlip =
    Number(
      data.amountInSlip ??
      rawSlip?.amount
        ?.amount ??
      0
    );

  const isAmountMatched =
    typeof data
      .isAmountMatched ===
    "boolean"

      ? data
          .isAmountMatched

      : (
          Number.isFinite(
            amountInSlip
          ) &&
          Math.abs(
            amountInSlip -
            Number(
              expectedAmount
            )
          ) <
          0.001
        );

  /*
   * EasySlip v2:
   * matchedAccount = object หรือ null
   */

  const matchedAccount =
    normalizeMatchedAccountObject(
      data.matchedAccount
    );

  return {
    isDuplicate:
      normalizeBooleanValue(
        data.isDuplicate
      ),

    matchedAccountMatched:
      Boolean(
        matchedAccount
      ),

    matchedAccount,

    amountInSlip,

    isAmountMatched,

    transRef:
      cleanText(
        rawSlip.transRef ||
        data.transRef
      ),

    senderName:
      getEasySlipAccountName(
        rawSlip.sender
      ),

    receiverName:
      getEasySlipAccountName(
        rawSlip.receiver
      ),

    message:
      cleanText(
        result.message
      ) ||
      "Bank slip verified successfully",
  };
}


function normalizeMatchedAccountObject(
  value
) {
  if (!value) {
    return null;
  }

  /*
   * EasySlip v2 ปัจจุบัน
   */

  if (
    typeof value ===
      "object" &&
    !Array.isArray(
      value
    )
  ) {
    return {
      bank:
        value.bank ||
        null,

      nameTh:
        cleanText(
          value.nameTh
        ),

      nameEn:
        cleanText(
          value.nameEn
        ),

      type:
        cleanText(
          value.type
        ),

      bankNumber:
        cleanText(
          value.bankNumber
        ),
    };
  }

  /*
   * compatibility
   */

  if (
    value === true ||
    value === 1 ||
    value === "1"
  ) {
    return {
      matched: true,
    };
  }

  if (
    typeof value ===
    "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    if (
      [
        "true",
        "matched",
        "success",
        "yes",
      ].includes(
        normalized
      )
    ) {
      return {
        matched: true,
      };
    }
  }

  return null;
}


function normalizeBooleanValue(
  value
) {
  if (
    value === true ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (
    typeof value ===
    "string"
  ) {
    return [
      "true",
      "yes",
      "duplicate",
      "duplicated",
    ].includes(
      value
        .trim()
        .toLowerCase()
    );
  }

  return false;
}


function normalizeEasySlipHttpStatus(
  error
) {
  const status =
    Number(
      error?.status ||
      0
    );

  if (
    [
      400,
      404,
      409,
      422,
    ].includes(
      status
    )
  ) {
    return status;
  }

  if (
    [
      401,
      403,
    ].includes(
      status
    )
  ) {
    return 502;
  }

  if (
    status ===
    429
  ) {
    return 503;
  }

  if (
    status >=
    500
  ) {
    return 502;
  }

  return 400;
}


function getEasySlipAccountName(
  party
) {
  const name =
    party?.account?.name ||
    {};

  return cleanText(
    name.th ||
    name.en ||
    party?.account
      ?.displayName ||
    party?.name ||
    ""
  );
}


function validateSlip(
  slip
) {
  if (
    !(slip instanceof File) ||
    slip.size === 0
  ) {
    return "กรุณาแนบภาพสลิป";
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (
    !allowedTypes.includes(
      slip.type
    )
  ) {
    return "ระบบตรวจอัตโนมัติรองรับ JPG, PNG, WEBP และ GIF เท่านั้น";
  }

  if (
    slip.size >
    4 * 1024 * 1024
  ) {
    return "ไฟล์สลิปต้องมีขนาดไม่เกิน 4 MB";
  }

  return "";
}


/*
 * =========================================
 * ACCESS CODE
 * =========================================
 */

async function verifyAccessCode(
  request,
  env,
  corsHeaders
) {
  const body =
    await readJson(
      request
    );

  const accessCode =
    cleanText(
      body.accessCode ??
      body.access_code
    ).toUpperCase();

  if (!accessCode) {
    return errorResponse(
      "กรุณากรอกรหัสเข้าชม",
      400,
      corsHeaders
    );
  }

  const result =
    await getApprovedOrderByAccessCode(
      accessCode,
      env
    );

  if (
    !result.ok
  ) {
    return errorResponse(
      result.message,
      result.status,
      corsHeaders
    );
  }

  return buildAccessVerificationResponse(
    result.order,
    result.concert,
    result.entitledSessions,
    corsHeaders
  );
}


/*
 * =========================================
 * VIEWING SESSION
 * =========================================
 */

async function startViewingSession(
  request,
  env,
  corsHeaders
) {
  const body =
    await readJson(
      request
    );

  const accessCode =
    cleanText(
      body.accessCode ??
      body.access_code
    ).toUpperCase();

  const deviceId =
    cleanText(
      body.deviceId ??
      body.device_id
    );

  if (!accessCode) {
    return errorResponse(
      "กรุณากรอกรหัสเข้าชม",
      400,
      corsHeaders
    );
  }

  if (!deviceId) {
    return errorResponse(
      "ไม่พบข้อมูลอุปกรณ์",
      400,
      corsHeaders
    );
  }

  if (
    deviceId.length >
    200
  ) {
    return errorResponse(
      "ข้อมูลอุปกรณ์ไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const result =
    await getApprovedOrderByAccessCode(
      accessCode,
      env
    );

  if (
    !result.ok
  ) {
    return errorResponse(
      result.message,
      result.status,
      corsHeaders
    );
  }

  const order =
    result.order;

  const now =
    new Date();

  const nowIso =
    now.toISOString();

  const staleBefore =
    new Date(
      now.getTime() -
      2 *
      60 *
      1000
    ).toISOString();

  /*
   * ปิด Session ค้าง
   */

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
      AND is_active = 1
      AND last_seen_at < ?
  `)
    .bind(
      order.id,
      staleBefore
    )
    .run();

  /*
   * ปิด Session เก่า
   * ของเครื่องเดิม
   */

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
      AND device_id = ?
      AND is_active = 1
  `)
    .bind(
      order.id,
      deviceId
    )
    .run();

  /*
   * ตรวจเครื่องอื่น
   */

  const activeOtherDevice =
    await env.DB.prepare(`
      SELECT
        id,
        device_id,
        last_seen_at
      FROM viewing_sessions
      WHERE order_id = ?
        AND is_active = 1
        AND device_id <> ?
      ORDER BY
        last_seen_at DESC
      LIMIT 1
    `)
      .bind(
        order.id,
        deviceId
      )
      .first();

  if (
    activeOtherDevice
  ) {
    return errorResponse(
      "สิทธิ์นี้กำลังถูกใช้งานอยู่บนอุปกรณ์อื่น กรุณาปิดการรับชมจากอุปกรณ์เดิมก่อน",
      409,
      corsHeaders
    );
  }

  const viewingSessionId =
    createId(
      "VS"
    );

  const sessionToken =
    createViewingSessionToken();

  await env.DB.prepare(`
    INSERT INTO viewing_sessions (
      id,
      order_id,
      access_code,
      device_id,
      session_token,
      created_at,
      last_seen_at,
      expires_at,
      is_active
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, 1
    )
  `)
    .bind(
      viewingSessionId,
      order.id,
      order.access_code,
      deviceId,
      sessionToken,
      nowIso,
      nowIso,
      order.access_expires_at
    )
    .run();

  return jsonResponse(
    {
      success: true,
      valid: true,

      sessionToken,

      sessionId:
        viewingSessionId,

      accessCode:
        order.access_code,

      accessExpiresAt:
        order.access_expires_at,

      concert:
        mapConcert(
          result.concert
        ),

      session:
        mapSelectedSession(
          order
        ),

      entitledSessions:
        mapEntitledSessions(
          result.entitledSessions
        ),

      package:
        mapOrderPackage(
          order
        ),

      message:
        "เริ่มเซสชันรับชมสำเร็จ",
    },
    200,
    corsHeaders
  );
}


async function checkViewingSession(
  request,
  env,
  corsHeaders
) {
  const body =
    await readJson(
      request
    );

  const sessionToken =
    cleanText(
      body.sessionToken ??
      body.session_token
    );

  const deviceId =
    cleanText(
      body.deviceId ??
      body.device_id
    );

  if (
    !sessionToken ||
    !deviceId
  ) {
    return errorResponse(
      "ข้อมูลเซสชันไม่ครบ",
      400,
      corsHeaders
    );
  }

  const viewingSession =
    await env.DB.prepare(`
      SELECT
        id,
        order_id,
        access_code,
        device_id,
        session_token,
        created_at,
        last_seen_at,
        expires_at,
        is_active
      FROM viewing_sessions
      WHERE session_token = ?
      LIMIT 1
    `)
      .bind(
        sessionToken
      )
      .first();

  if (
    !viewingSession
  ) {
    return errorResponse(
      "ไม่พบเซสชันรับชม",
      404,
      corsHeaders
    );
  }

  if (
    Number(
      viewingSession.is_active
    ) !== 1
  ) {
    return errorResponse(
      "เซสชันนี้ถูกยกเลิกแล้ว",
      403,
      corsHeaders
    );
  }

  if (
    viewingSession.device_id !==
    deviceId
  ) {
    return errorResponse(
      "เซสชันนี้ไม่ตรงกับอุปกรณ์",
      403,
      corsHeaders
    );
  }

  const expiresAt =
    new Date(
      viewingSession.expires_at
    );

  if (
    Number.isNaN(
      expiresAt.getTime()
    ) ||
    Date.now() >
    expiresAt.getTime()
  ) {
    await deactivateViewingSession(
      viewingSession.id,
      env
    );

    return errorResponse(
      "สิทธิ์การรับชมหมดอายุแล้ว",
      403,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT
        id,
        status,
        access_code,
        access_expires_at,
        concert_id,
        package_id,
        package_name,
        access_type,
        replay_days,
        replay_months,
        has_ecard,
        video_quality,
        selected_session_id,
        selected_session_name,
        selected_session_starts_at,
        selected_session_ends_at
      FROM orders
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        viewingSession.order_id
      )
      .first();

  if (
    !order ||
    order.status !==
    "approved"
  ) {
    await deactivateViewingSession(
      viewingSession.id,
      env
    );

    return errorResponse(
      "สิทธิ์การรับชมถูกยกเลิก",
      403,
      corsHeaders
    );
  }

  const orderExpiresAt =
    new Date(
      order.access_expires_at
    );

  if (
    !order.access_expires_at ||
    Number.isNaN(
      orderExpiresAt.getTime()
    ) ||
    Date.now() >
    orderExpiresAt.getTime()
  ) {
    await deactivateViewingSession(
      viewingSession.id,
      env
    );

    return errorResponse(
      "สิทธิ์การรับชมหมดอายุแล้ว",
      403,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET last_seen_at = ?
    WHERE id = ?
      AND is_active = 1
  `)
    .bind(
      new Date()
        .toISOString(),
      viewingSession.id
    )
    .run();

  let entitledSessions =
    await getOrderSessionSnapshots(
      order.id,
      env
    );

  if (
    entitledSessions.length ===
      0 &&
    order.selected_session_id
  ) {
    entitledSessions = [
      {
        order_id:
          order.id,

        session_id:
          order
            .selected_session_id,

        session_name:
          order
            .selected_session_name ||
          "",

        live_starts_at:
          order
            .selected_session_starts_at ||
          null,

        live_ends_at:
          order
            .selected_session_ends_at ||
          null,
      },
    ];
  }

  return jsonResponse(
    {
      success: true,
      valid: true,

      sessionToken:
        viewingSession
          .session_token,

      accessCode:
        order.access_code,

      accessExpiresAt:
        order.access_expires_at,

      entitledSessions:
        mapEntitledSessions(
          entitledSessions
        ),

      package:
        mapOrderPackage(
          order
        ),

      message:
        "เซสชันรับชมยังใช้งานได้",
    },
    200,
    corsHeaders
  );
}


async function endViewingSession(
  request,
  env,
  corsHeaders
) {
  const body =
    await readJson(
      request
    );

  const sessionToken =
    cleanText(
      body.sessionToken ??
      body.session_token
    );

  const deviceId =
    cleanText(
      body.deviceId ??
      body.device_id
    );

  if (
    !sessionToken ||
    !deviceId
  ) {
    return errorResponse(
      "ข้อมูลเซสชันไม่ครบ",
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE session_token = ?
      AND device_id = ?
  `)
    .bind(
      sessionToken,
      deviceId
    )
    .run();

  return jsonResponse(
    {
      success: true,
      message:
        "สิ้นสุดเซสชันรับชมแล้ว",
    },
    200,
    corsHeaders
  );
}


async function deactivateViewingSession(
  sessionId,
  env
) {
  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE id = ?
  `)
    .bind(
      sessionId
    )
    .run();
}


/*
 * =========================================
 * APPROVED ORDER
 * =========================================
 */

async function getApprovedOrderByAccessCode(
  accessCode,
  env
) {
  const order =
    await env.DB.prepare(`
      SELECT
        id,
        package_number,
        price,
        status,
        created_at,
        concert_id,
        package_id,
        package_name,
        access_type,
        replay_days,
        replay_months,
        has_ecard,
        video_quality,
        selected_session_id,
        selected_session_name,
        selected_session_starts_at,
        selected_session_ends_at,
        access_code,
        approved_at,
        access_expires_at
      FROM orders
      WHERE
        UPPER(access_code) =
        UPPER(?)
      LIMIT 1
    `)
      .bind(
        accessCode
      )
      .first();

  if (!order) {
    return {
      ok: false,
      status: 404,
      message:
        "ไม่พบรหัสเข้าชมนี้",
    };
  }

  if (
    order.status !==
    "approved"
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "รหัสเข้าชมนี้ยังไม่ได้รับการอนุมัติ",
    };
  }

  if (
    !order.access_expires_at
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "รหัสเข้าชมนี้ไม่มีวันหมดอายุที่ถูกต้อง",
    };
  }

  const expiresAt =
    new Date(
      order.access_expires_at
    );

  if (
    Number.isNaN(
      expiresAt.getTime()
    )
  ) {
    return {
      ok: false,
      status: 500,
      message:
        "ข้อมูลวันหมดอายุของรหัสไม่ถูกต้อง",
    };
  }

  if (
    Date.now() >
    expiresAt.getTime()
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "รหัสเข้าชมนี้หมดอายุแล้ว",
    };
  }

  const concert =
    await env.DB.prepare(`
      SELECT
        id,
        title,
        description,
        cover_image_url,
        live_starts_at,
        live_ends_at,
        status
      FROM concerts
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        order.concert_id
      )
      .first();

  if (!concert) {
    return {
      ok: false,
      status: 404,
      message:
        "ไม่พบข้อมูลคอนเสิร์ตของรหัสนี้",
    };
  }

  let entitledSessions =
    await getOrderSessionSnapshots(
      order.id,
      env
    );

  if (
    entitledSessions.length ===
      0 &&
    order.selected_session_id
  ) {
    entitledSessions = [
      {
        order_id:
          order.id,

        session_id:
          order
            .selected_session_id,

        session_name:
          order
            .selected_session_name ||
          "",

        live_starts_at:
          order
            .selected_session_starts_at ||
          null,

        live_ends_at:
          order
            .selected_session_ends_at ||
          null,
      },
    ];
  }

  return {
    ok: true,
    status: 200,
    order,
    concert,
    entitledSessions,
  };
}


/*
 * =========================================
 * ACCESS RESPONSE
 * =========================================
 */

function buildAccessVerificationResponse(
  order,
  concert,
  entitledSessions,
  corsHeaders
) {
  return jsonResponse(
    {
      success: true,
      valid: true,

      orderId:
        order.id,

      accessCode:
        order.access_code,

      approvedAt:
        order.approved_at,

      accessExpiresAt:
        order.access_expires_at,

      concert:
        mapConcert(
          concert
        ),

      session:
        mapSelectedSession(
          order
        ),

      entitledSessions:
        mapEntitledSessions(
          entitledSessions
        ),

      package:
        mapOrderPackage(
          order
        ),

      message:
        "รหัสเข้าชมถูกต้อง",
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * ADMIN ORDERS
 * =========================================
 */

async function getOrders(
  url,
  env,
  corsHeaders
) {
  const status =
    cleanText(
      url.searchParams.get(
        "status"
      )
    ) ||
    "pending";

  const search =
    cleanText(
      url.searchParams.get(
        "search"
      )
    );

  const allowed = [
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "all",
  ];

  if (
    !allowed.includes(
      status
    )
  ) {
    return errorResponse(
      "สถานะไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const limit =
    Math.min(
      Math.max(
        normalizePositiveInteger(
          url.searchParams.get(
            "limit"
          ),
          100
        ),
        1
      ),
      500
    );

  let sql = `
    SELECT
      o.id,
      o.package_number,
      o.price,
      o.slip_key,
      o.status,
      o.created_at,
      o.access_code,
      o.approved_at,
      o.access_expires_at,
      o.concert_id,
      o.package_id,
      o.package_name,
      o.access_type,
      o.replay_days,
      o.replay_months,
      o.has_ecard,
      o.video_quality,
      o.selected_session_id,
      o.selected_session_name,
      o.selected_session_starts_at,
      o.selected_session_ends_at,
      o.easyslip_trans_ref,
      o.easyslip_verified_at,
      o.easyslip_amount,
      o.easyslip_receiver_name,
      o.easyslip_sender_name,
      o.easyslip_status,
      o.easyslip_message,
      c.title AS concert_title,
      c.cover_image_url
    FROM orders o
    LEFT JOIN concerts c
      ON c.id =
        o.concert_id
    WHERE 1 = 1
  `;

  const bindings =
    [];

  if (
    status !==
    "all"
  ) {
    sql +=
      " AND o.status = ?";

    bindings.push(
      status
    );
  }

  if (
    search
  ) {
    sql += `
      AND (
        o.id LIKE ?
        OR o.access_code LIKE ?
        OR o.package_name LIKE ?
        OR c.title LIKE ?
        OR o.easyslip_trans_ref LIKE ?
        OR o.easyslip_sender_name LIKE ?
        OR o.easyslip_receiver_name LIKE ?
      )
    `;

    const keyword =
      "%" +
      search +
      "%";

    bindings.push(
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword
    );
  }

  sql +=
    " ORDER BY o.created_at DESC LIMIT ?";

  bindings.push(
    limit
  );

  const result =
    await env.DB.prepare(
      sql
    )
      .bind(
        ...bindings
      )
      .all();

  const orders =
    [];

  for (
    const order
    of (
      result.results ||
      []
    )
  ) {
    let entitledSessions =
      await getOrderSessionSnapshots(
        order.id,
        env
      );

    if (
      entitledSessions.length ===
        0 &&
      order.selected_session_id
    ) {
      entitledSessions = [
        {
          session_id:
            order
              .selected_session_id,

          session_name:
            order
              .selected_session_name ||
            "",

          live_starts_at:
            order
              .selected_session_starts_at ||
            null,

          live_ends_at:
            order
              .selected_session_ends_at ||
            null,
        },
      ];
    }

    order.price =
      Number(
        order.price ||
        0
      );

    order.easyslip_amount =
      order.easyslip_amount ==
      null
        ? null
        : Number(
            order.easyslip_amount
          );

    order.replay_days =
      Number(
        order.replay_days ||
        0
      );

    order.replay_months =
      Number(
        order.replay_months ||
        0
      );

    order.has_ecard =
      Number(
        order.has_ecard
      ) === 1
        ? 1
        : 0;

    order.video_quality =
      order.video_quality ||
      "1080p";

    order.entitled_sessions =
      mapEntitledSessions(
        entitledSessions
      ).map(
        item => ({
          id:
            item.id,

          name:
            item.name,

          live_starts_at:
            item.liveStartsAt,

          live_ends_at:
            item.liveEndsAt,
        })
      );

    orders.push(
      order
    );
  }

  return jsonResponse(
    {
      success: true,
      orders,
      count:
        orders.length,
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * ADMIN ORDER DETAIL
 * =========================================
 */

async function getAdminOrderDetail(
  orderId,
  env,
  corsHeaders
) {
  if (!orderId) {
    return errorResponse(
      "ไม่พบเลขคำสั่งซื้อ",
      400,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT
        o.*,

        c.title
          AS concert_title,

        c.description
          AS concert_description,

        c.cover_image_url

      FROM orders o

      LEFT JOIN concerts c
        ON c.id =
          o.concert_id

      WHERE o.id = ?
      LIMIT 1
    `)
      .bind(
        orderId
      )
      .first();

  if (!order) {
    return errorResponse(
      "ไม่พบคำสั่งซื้อ",
      404,
      corsHeaders
    );
  }

  let sessions =
    await getOrderSessionSnapshots(
      order.id,
      env
    );

  if (
    sessions.length === 0 &&
    order.selected_session_id
  ) {
    sessions = [
      {
        session_id:
          order
            .selected_session_id,

        session_name:
          order
            .selected_session_name ||
          "",

        live_starts_at:
          order
            .selected_session_starts_at ||
          null,

        live_ends_at:
          order
            .selected_session_ends_at ||
          null,
      },
    ];
  }

  return jsonResponse(
    {
      success: true,

      order: {
        id:
          order.id,

        packageNumber:
          order.package_number,

        price:
          Number(
            order.price ||
            0
          ),

        status:
          order.status,

        createdAt:
          order.created_at,

        concert: {
          id:
            order.concert_id,

          title:
            order
              .concert_title ||
            "",

          description:
            order
              .concert_description ||
            "",

          coverImageUrl:
            order
              .cover_image_url ||
            "",
        },

        package:
          mapOrderPackage(
            order
          ),

        selectedSession:
          mapSelectedSession(
            order
          ),

        entitledSessions:
          mapEntitledSessions(
            sessions
          ),

        accessCode:
          order.access_code ||
          "",

        approvedAt:
          order.approved_at ||
          null,

        accessExpiresAt:
          order.access_expires_at ||
          null,

        easySlip: {
          transRef:
            order
              .easyslip_trans_ref ||
            "",

          verifiedAt:
            order
              .easyslip_verified_at ||
            null,

          amount:
            order.easyslip_amount ==
            null
              ? null
              : Number(
                  order
                    .easyslip_amount
                ),

          receiverName:
            order
              .easyslip_receiver_name ||
            "",

          senderName:
            order
              .easyslip_sender_name ||
            "",

          status:
            order
              .easyslip_status ||
            "",

          message:
            order
              .easyslip_message ||
            "",
        },
      },
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * GET SLIP
 * =========================================
 */

async function getSlip(
  orderId,
  env,
  corsHeaders
) {
  if (!orderId) {
    return errorResponse(
      "ไม่พบเลขคำสั่งซื้อ",
      400,
      corsHeaders
    );
  }

  if (!env.SLIPS) {
    return errorResponse(
      "ไม่พบระบบจัดเก็บสลิป",
      500,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT slip_key
      FROM orders
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        orderId
      )
      .first();

  if (!order) {
    return errorResponse(
      "ไม่พบคำสั่งซื้อ",
      404,
      corsHeaders
    );
  }

  if (
    !order.slip_key
  ) {
    return errorResponse(
      "คำสั่งซื้อนี้ไม่มีไฟล์สลิป",
      404,
      corsHeaders
    );
  }

  const object =
    await env.SLIPS.get(
      order.slip_key
    );

  if (!object) {
    return errorResponse(
      "ไม่พบไฟล์สลิป",
      404,
      corsHeaders
    );
  }

  const headers =
    new Headers(
      corsHeaders
    );

  object.writeHttpMetadata(
    headers
  );

  headers.set(
    "Content-Type",
    object.httpMetadata
      ?.contentType ||
      "image/jpeg"
  );

  headers.set(
    "Cache-Control",
    "private, no-store"
  );

  headers.set(
    "Content-Disposition",
    "inline"
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  return new Response(
    object.body,
    {
      status: 200,
      headers,
    }
  );
}


/*
 * =========================================
 * ORDER STATUS
 * =========================================
 */

async function updateOrderStatus(
  orderId,
  request,
  env,
  corsHeaders
) {
  if (!orderId) {
    return errorResponse(
      "ไม่พบเลขคำสั่งซื้อ",
      400,
      corsHeaders
    );
  }

  const body =
    await readJson(
      request
    );

  const newStatus =
    cleanText(
      body.status
    );

  if (
    ![
      "approved",
      "rejected",
    ].includes(
      newStatus
    )
  ) {
    return errorResponse(
      "สถานะต้องเป็น approved หรือ rejected",
      400,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT *
      FROM orders
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        orderId
      )
      .first();

  if (!order) {
    return errorResponse(
      "ไม่พบคำสั่งซื้อ",
      404,
      corsHeaders
    );
  }

  /*
   * =========================================
   * REJECT
   * =========================================
   */

  if (
    newStatus ===
    "rejected"
  ) {
    await env.DB.prepare(`
      UPDATE orders
      SET
        status = 'rejected',
        access_code = NULL,
        approved_at = NULL,
        access_expires_at = NULL
      WHERE id = ?
    `)
      .bind(
        orderId
      )
      .run();

    await env.DB.prepare(`
      UPDATE viewing_sessions
      SET is_active = 0
      WHERE order_id = ?
        AND is_active = 1
    `)
      .bind(
        orderId
      )
      .run();

    return jsonResponse(
      {
        success: true,
        orderId,
        status:
          "rejected",

        message:
          "ปฏิเสธการชำระเงินสำเร็จ",
      },
      200,
      corsHeaders
    );
  }

  /*
   * =========================================
   * APPROVE
   * =========================================
   */

  const approvedAt =
    order.approved_at ||
    new Date()
      .toISOString();

  const accessCode =
    order.access_code ||
    createAccessCode();

  /*
   * =========================================
   * RESTORE / CREATE SESSION SNAPSHOT
   * =========================================
   */

  let existingSnapshots =
    await getOrderSessionSnapshots(
      orderId,
      env
    );

  if (
    existingSnapshots.length ===
    0
  ) {
    let sessionsToSnapshot =
      [];

    /*
     * ถ้ามีวันที่ลูกค้าเลือกไว้
     * = สิทธิ์แบบ single
     */

    if (
      order.selected_session_id
    ) {
      sessionsToSnapshot = [
        {
          id:
            order
              .selected_session_id,

          name:
            order
              .selected_session_name ||
            "",

          live_starts_at:
            order
              .selected_session_starts_at ||
            null,

          live_ends_at:
            order
              .selected_session_ends_at ||
            null,
        },
      ];

    } else if (
      order.package_id &&
      order.concert_id
    ) {
      /*
       * ไม่มี selected session
       * ต้องตรวจว่า package เป็น all จริงหรือไม่
       */

      const packageData =
        await env.DB.prepare(`
          SELECT
            session_selection_mode
          FROM packages
          WHERE id = ?
            AND concert_id = ?
          LIMIT 1
        `)
          .bind(
            order.package_id,
            order.concert_id
          )
          .first();

      const selectionMode =
        normalizeSessionSelectionMode(
          packageData
            ?.session_selection_mode
        ) ||
        "single";

      if (
        selectionMode ===
        "all"
      ) {
        sessionsToSnapshot =
          await getPackageEntitledSessions(
            order.package_id,
            order.concert_id,
            env
          );
      }
    }

    /*
     * single แต่ไม่มี session
     * หรือ all แต่ไม่มี session ที่ผูกไว้
     */

    if (
      sessionsToSnapshot.length ===
      0
    ) {
      return errorResponse(
        "ไม่สามารถระบุสิทธิ์วันรับชมของคำสั่งซื้อนี้ได้ กรุณาตรวจสอบแพ็กเกจและวันแสดง",
        400,
        corsHeaders
      );
    }

    await saveOrderSessionSnapshots(
      orderId,
      sessionsToSnapshot,
      env
    );

    existingSnapshots =
      await getOrderSessionSnapshots(
        orderId,
        env
      );
  }

  /*
   * =========================================
   * CALCULATE EXPIRY
   * =========================================
   */

  const accessExpiresAt =
    order.access_expires_at ||
    await calculateAccessExpiry(
      {
        ...order,

        approved_at:
          approvedAt,
      },
      env
    );

  if (
    !accessExpiresAt
  ) {
    return errorResponse(
      "ไม่สามารถคำนวณวันหมดอายุสิทธิ์ได้ กรุณาตรวจสอบข้อมูลแพ็กเกจ",
      400,
      corsHeaders
    );
  }

  /*
   * =========================================
   * UPDATE ORDER
   * =========================================
   */

  await env.DB.prepare(`
    UPDATE orders
    SET
      status = 'approved',
      access_code = ?,
      approved_at = ?,
      access_expires_at = ?
    WHERE id = ?
  `)
    .bind(
      accessCode,
      approvedAt,
      accessExpiresAt,
      orderId
    )
    .run();

  /*
   * =========================================
   * RESPONSE
   * =========================================
   */

  return jsonResponse(
    {
      success: true,

      orderId,

      status:
        "approved",

      accessCode,

      approvedAt,

      accessExpiresAt,

      selectedSession:
        mapSelectedSession(
          order
        ),

      entitledSessions:
        mapEntitledSessions(
          existingSnapshots
        ),

      package:
        mapOrderPackage(
          order
        ),

      message:
        "อนุมัติการชำระเงินสำเร็จ",
    },
    200,
    corsHeaders
  );
}
/*
 * =========================================
 * CANCEL ORDER
 * =========================================
 */

async function cancelAdminOrder(
  orderId,
  env,
  corsHeaders
) {
  if (!orderId) {
    return errorResponse(
      "ไม่พบเลขคำสั่งซื้อ",
      400,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT
        id,
        status
      FROM orders
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        orderId
      )
      .first();

  if (!order) {
    return errorResponse(
      "ไม่พบคำสั่งซื้อ",
      404,
      corsHeaders
    );
  }

  if (
    order.status ===
    "cancelled"
  ) {
    return jsonResponse(
      {
        success: true,
        message:
          "คำสั่งซื้อนี้ถูกยกเลิกอยู่แล้ว",
      },
      200,
      corsHeaders
    );
  }

  await env.DB.prepare(`
    UPDATE orders
    SET
      status = 'cancelled'
    WHERE id = ?
  `)
    .bind(
      orderId
    )
    .run();

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
  `)
    .bind(
      orderId
    )
    .run();

  return jsonResponse(
    {
      success: true,
      orderId,
      status:
        "cancelled",

      message:
        "ยกเลิกคำสั่งซื้อและสิทธิ์รับชมเรียบร้อยแล้ว",
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * REACTIVATE ORDER
 * =========================================
 */

async function reactivateAdminOrder(
  orderId,
  env,
  corsHeaders
) {
  if (!orderId) {
    return errorResponse(
      "ไม่พบเลขคำสั่งซื้อ",
      400,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT *
      FROM orders
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        orderId
      )
      .first();

  if (!order) {
    return errorResponse(
      "ไม่พบคำสั่งซื้อ",
      404,
      corsHeaders
    );
  }

  /*
   * =========================================
   * RESTORE SESSION RIGHTS
   * =========================================
   */

  let existingSnapshots =
    await getOrderSessionSnapshots(
      orderId,
      env
    );

  if (
    existingSnapshots.length ===
    0
  ) {
    let sessionsToSnapshot =
      [];

    /*
     * SINGLE
     */

    if (
      order.selected_session_id
    ) {
      sessionsToSnapshot = [
        {
          id:
            order.selected_session_id,

          name:
            order.selected_session_name ||
            "",

          live_starts_at:
            order.selected_session_starts_at ||
            null,

          live_ends_at:
            order.selected_session_ends_at ||
            null,
        },
      ];

    } else if (
      order.package_id &&
      order.concert_id
    ) {
      /*
       * ALL
       */

      const packageData =
        await env.DB.prepare(`
          SELECT
            session_selection_mode
          FROM packages
          WHERE id = ?
            AND concert_id = ?
          LIMIT 1
        `)
          .bind(
            order.package_id,
            order.concert_id
          )
          .first();

      const selectionMode =
        normalizeSessionSelectionMode(
          packageData
            ?.session_selection_mode
        ) ||
        "single";

      if (
        selectionMode ===
        "all"
      ) {
        sessionsToSnapshot =
          await getPackageEntitledSessions(
            order.package_id,
            order.concert_id,
            env
          );
      }
    }

    if (
      sessionsToSnapshot.length ===
      0
    ) {
      return errorResponse(
        "ไม่สามารถระบุสิทธิ์วันรับชมของคำสั่งซื้อนี้ได้ กรุณาตรวจสอบแพ็กเกจและวันแสดง",
        400,
        corsHeaders
      );
    }

    await saveOrderSessionSnapshots(
      orderId,
      sessionsToSnapshot,
      env
    );

    existingSnapshots =
      await getOrderSessionSnapshots(
        orderId,
        env
      );
  }

  /*
   * =========================================
   * NEW APPROVAL
   * =========================================
   */

  const approvedAt =
    new Date()
      .toISOString();

  const accessCode =
    order.access_code ||
    createAccessCode();

  const accessExpiresAt =
    await calculateAccessExpiry(
      {
        ...order,

        approved_at:
          approvedAt,
      },
      env
    );

  if (
    !accessExpiresAt
  ) {
    return errorResponse(
      "ไม่สามารถคำนวณวันหมดอายุสิทธิ์ใหม่ได้",
      400,
      corsHeaders
    );
  }

  /*
   * ปิด viewing session เก่า
   */

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
      AND is_active = 1
  `)
    .bind(
      orderId
    )
    .run();

  /*
   * เปิดสิทธิ์ใหม่
   */

  await env.DB.prepare(`
    UPDATE orders
    SET
      status = 'approved',
      access_code = ?,
      approved_at = ?,
      access_expires_at = ?
    WHERE id = ?
  `)
    .bind(
      accessCode,
      approvedAt,
      accessExpiresAt,
      orderId
    )
    .run();

  return jsonResponse(
    {
      success: true,

      orderId,

      status:
        "approved",

      accessCode,

      approvedAt,

      accessExpiresAt,

      selectedSession:
        mapSelectedSession(
          order
        ),

      entitledSessions:
        mapEntitledSessions(
          existingSnapshots
        ),

      package:
        mapOrderPackage(
          order
        ),

      message:
        "เปิดสิทธิ์คำสั่งซื้ออีกครั้งเรียบร้อยแล้ว",
    },
    200,
    corsHeaders
  );
}

/*
 * =========================================
 * REGENERATE ACCESS CODE
 * =========================================
 */

async function regenerateAccessCode(
  orderId,
  env,
  corsHeaders
) {
  if (!orderId) {
    return errorResponse(
      "ไม่พบเลขคำสั่งซื้อ",
      400,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(`
      SELECT
        id,
        status
      FROM orders
      WHERE id = ?
      LIMIT 1
    `)
      .bind(
        orderId
      )
      .first();

  if (!order) {
    return errorResponse(
      "ไม่พบคำสั่งซื้อ",
      404,
      corsHeaders
    );
  }

  if (
    order.status !==
    "approved"
  ) {
    return errorResponse(
      "สามารถสร้างรหัสใหม่ได้เฉพาะคำสั่งซื้อที่อนุมัติแล้ว",
      400,
      corsHeaders
    );
  }

  const accessCode =
    createAccessCode();

  await env.DB.prepare(`
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
  `)
    .bind(
      orderId
    )
    .run();

  await env.DB.prepare(`
    UPDATE orders
    SET access_code = ?
    WHERE id = ?
  `)
    .bind(
      accessCode,
      orderId
    )
    .run();

  return jsonResponse(
    {
      success: true,
      orderId,
      accessCode,

      message:
        "สร้างรหัสเข้าชมใหม่เรียบร้อยแล้ว รหัสเดิมถูกยกเลิก",
    },
    200,
    corsHeaders
  );
}


/*
 * =========================================
 * PACKAGE / SESSION HELPERS
 * =========================================
 */

async function replacePackageSessions(
  packageId,
  sessionIds,
  env
) {
  await env.DB.prepare(`
    DELETE FROM package_sessions
    WHERE package_id = ?
  `)
    .bind(
      packageId
    )
    .run();

  const now =
    new Date()
      .toISOString();

  for (
    const sessionId
    of sessionIds
  ) {
    await env.DB.prepare(`
      INSERT OR IGNORE
      INTO package_sessions (
        package_id,
        session_id,
        created_at
      )
      VALUES (
        ?, ?, ?
      )
    `)
      .bind(
        packageId,
        sessionId,
        now
      )
      .run();
  }
}


async function getPackageEntitledSessions(
  packageId,
  concertId,
  env
) {
  if (
    !packageId ||
    !concertId
  ) {
    return [];
  }

  const result =
    await env.DB.prepare(`
      SELECT
        s.id,
        s.concert_id,
        s.name,
        s.live_starts_at,
        s.live_ends_at,
        s.sort_order

      FROM package_sessions ps

      INNER JOIN concert_sessions s
        ON s.id =
          ps.session_id

      WHERE
        ps.package_id = ?
        AND s.concert_id = ?
        AND s.is_active = 1

      ORDER BY
        s.sort_order ASC,
        s.live_starts_at ASC
    `)
      .bind(
        packageId,
        concertId
      )
      .all();

  return (
    result.results ||
    []
  );
}


async function saveOrderSessionSnapshots(
  orderId,
  sessions,
  env
) {
  if (!orderId) {
    throw new Error(
      "Order ID is missing"
    );
  }

  if (
    !Array.isArray(
      sessions
    ) ||
    sessions.length ===
      0
  ) {
    throw new Error(
      "Order session rights are empty"
    );
  }

  const now =
    new Date()
      .toISOString();

  await env.DB.prepare(`
    DELETE FROM order_sessions
    WHERE order_id = ?
  `)
    .bind(
      orderId
    )
    .run();

  for (
    const session
    of sessions
  ) {
    const sessionId =
      cleanText(
        session.id ||
        session.session_id
      );

    if (!sessionId) {
      throw new Error(
        "Session ID is missing"
      );
    }

    await env.DB.prepare(`
      INSERT INTO order_sessions (
        order_id,
        session_id,
        session_name,
        live_starts_at,
        live_ends_at,
        created_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?
      )
    `)
      .bind(
        orderId,
        sessionId,

        cleanText(
          session.name ||
          session.session_name
        ) ||
        null,

        session.live_starts_at ||
        null,

        session.live_ends_at ||
        null,

        now
      )
      .run();
  }
}


async function getOrderSessionSnapshots(
  orderId,
  env
) {
  if (!orderId) {
    return [];
  }

  const result =
    await env.DB.prepare(`
      SELECT
        order_id,
        session_id,
        session_name,
        live_starts_at,
        live_ends_at,
        created_at
      FROM order_sessions
      WHERE order_id = ?
      ORDER BY
        live_starts_at ASC,
        created_at ASC
    `)
      .bind(
        orderId
      )
      .all();

  return (
    result.results ||
    []
  );
}


async function validateSessionsForConcert(
  concertId,
  sessionIds,
  env
) {
  if (
    !Array.isArray(
      sessionIds
    ) ||
    sessionIds.length ===
      0
  ) {
    return false;
  }

  const placeholders =
    sessionIds
      .map(
        () => "?"
      )
      .join(",");

  const result =
    await env.DB.prepare(`
      SELECT
        COUNT(*) AS total
      FROM concert_sessions
      WHERE
        concert_id = ?
        AND is_active = 1
        AND id IN (
          ${placeholders}
        )
    `)
      .bind(
        concertId,
        ...sessionIds
      )
      .first();

  return (
    Number(
      result?.total ||
      0
    ) ===
    sessionIds.length
  );
}


async function updateConcertTimeRange(
  concertId,
  env
) {
  const range =
    await env.DB.prepare(`
      SELECT
        MIN(live_starts_at)
          AS first_start,

        MAX(live_ends_at)
          AS last_end

      FROM concert_sessions

      WHERE
        concert_id = ?
        AND is_active = 1
    `)
      .bind(
        concertId
      )
      .first();

  if (
    !range?.first_start ||
    !range?.last_end
  ) {
    return;
  }

  await env.DB.prepare(`
    UPDATE concerts
    SET
      live_starts_at = ?,
      live_ends_at = ?,
      updated_at = ?
    WHERE id = ?
  `)
    .bind(
      range.first_start,
      range.last_end,
      new Date()
        .toISOString(),
      concertId
    )
    .run();
}


/*
 * =========================================
 * ACCESS EXPIRY
 * =========================================
 */

async function calculateAccessExpiry(
  order,
  env
) {
  const accessType =
    cleanText(
      order.access_type
    ).toLowerCase() ||
    "live";

  /*
   * =========================================
   * REPLAY ONLY
   * =========================================
   */

  if (
    accessType ===
    "replay"
  ) {
    const approvedAt =
      order.approved_at ||
      new Date()
        .toISOString();

    const expiry =
      new Date(
        approvedAt
      );

    if (
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return null;
    }

    const replayMonths =
      Number(
        order.replay_months ||
        0
      );

    const replayDays =
      Number(
        order.replay_days ||
        0
      );

    if (
      replayMonths >
      0
    ) {
      addUtcCalendarMonths(
        expiry,
        replayMonths
      );

    } else if (
      replayDays >
      0
    ) {
      expiry.setUTCDate(
        expiry.getUTCDate() +
        replayDays
      );

    } else {
      return null;
    }

    return expiry
      .toISOString();
  }

  /*
   * =========================================
   * LIVE / LIVE + REPLAY
   * =========================================
   */

  let finalSessionEnd =
  order
    .selected_session_ends_at ||
  null;

/*
 * =========================================
 * ใช้ ORDER SNAPSHOT ก่อน
 * =========================================
 */

if (
  !finalSessionEnd &&
  order.id &&
  env?.DB
) {
  const snapshotResult =
    await env.DB.prepare(`
      SELECT
        MAX(
          live_ends_at
        ) AS final_end
      FROM order_sessions
      WHERE order_id = ?
    `)
      .bind(
        order.id
      )
      .first();

  finalSessionEnd =
    snapshotResult?.final_end ||
    null;
}

/*
 * =========================================
 * fallback จาก package
 * =========================================
 */

if (
  !finalSessionEnd &&
  order.package_id &&
  env?.DB
) {
  const result =
    await env.DB.prepare(`
      SELECT
        MAX(
          s.live_ends_at
        ) AS final_end

      FROM package_sessions ps

      INNER JOIN concert_sessions s
        ON s.id =
          ps.session_id

      WHERE
        ps.package_id = ?
        AND s.is_active = 1
    `)
      .bind(
        order.package_id
      )
      .first();

  finalSessionEnd =
    result?.final_end ||
    null;
}
/*
 * =========================================
 * fallback จาก concert
 * =========================================
 */

  if (
    !finalSessionEnd &&
    order.concert_id &&
    env?.DB
  ) {
    const concert =
      await env.DB.prepare(`
        SELECT
          live_ends_at
        FROM concerts
        WHERE id = ?
        LIMIT 1
      `)
        .bind(
          order.concert_id
        )
        .first();

    finalSessionEnd =
      concert?.live_ends_at ||
      null;
  }

  if (
    !finalSessionEnd
  ) {
    return null;
  }

  const expiry =
    new Date(
      finalSessionEnd
    );

  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return null;
  }

  /*
   * LIVE ONLY
   * เพิ่ม buffer 2 ชั่วโมง
   */

  if (
    accessType ===
    "live"
  ) {
    expiry.setUTCHours(
      expiry.getUTCHours() +
      2
    );

    return expiry
      .toISOString();
  }

  /*
   * LIVE + REPLAY
   */

  if (
    accessType ===
      "live_replay" ||
    accessType ===
      "live+replay"
  ) {
    const replayMonths =
      Number(
        order.replay_months ||
        0
      );

    const replayDays =
      Number(
        order.replay_days ||
        0
      );

    if (
      replayMonths >
      0
    ) {
      addUtcCalendarMonths(
        expiry,
        replayMonths
      );

    } else if (
      replayDays >
      0
    ) {
      expiry.setUTCDate(
        expiry.getUTCDate() +
        replayDays
      );

    } else {
      return null;
    }

    return expiry
      .toISOString();
  }

  return null;
}


function addUtcCalendarMonths(
  date,
  months
) {
  const originalDay =
    date.getUTCDate();

  date.setUTCDate(
    1
  );

  date.setUTCMonth(
    date.getUTCMonth() +
    months
  );

  const lastDay =
    new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() +
        1,
        0
      )
    ).getUTCDate();

  date.setUTCDate(
    Math.min(
      originalDay,
      lastDay
    )
  );

  return date;
}


/*
 * =========================================
 * LINE WEBHOOK
 * =========================================
 */

async function handleLineWebhook(
  request,
  env
) {
  if (
    !env.LINE_CHANNEL_SECRET
  ) {
    return new Response(
      "LINE_CHANNEL_SECRET is not configured",
      {
        status: 500,
      }
    );
  }

  if (
    !env.LINE_CHANNEL_ACCESS_TOKEN
  ) {
    return new Response(
      "LINE_CHANNEL_ACCESS_TOKEN is not configured",
      {
        status: 500,
      }
    );
  }

  if (!env.DB) {
    return new Response(
      "DB binding is not configured",
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get(
      "x-line-signature"
    );

  if (!signature) {
    return new Response(
      "Missing LINE signature",
      {
        status: 401,
      }
    );
  }

  const bodyText =
    await request.text();

  const signatureValid =
    await verifyLineSignature(
      bodyText,
      signature,
      env.LINE_CHANNEL_SECRET
    );

  if (
    !signatureValid
  ) {
    return new Response(
      "Invalid LINE signature",
      {
        status: 401,
      }
    );
  }

  let payload;

  try {
    payload =
      JSON.parse(
        bodyText
      );

  } catch {
    return new Response(
      "Invalid JSON",
      {
        status: 400,
      }
    );
  }

  const events =
    Array.isArray(
      payload.events
    )
      ? payload.events
      : [];

  for (
    const event
    of events
  ) {
    try {
      await processLineEvent(
        event,
        env
      );

    } catch (error) {
      console.error(
        "Process LINE event failed:",
        error?.message ||
        String(
          error
        )
      );
    }
  }

  return new Response(
    "OK",
    {
      status: 200,

      headers: {
        "Content-Type":
          "text/plain; charset=UTF-8",
      },
    }
  );
}


async function processLineEvent(
  event,
  env
) {
  const eventType =
    cleanText(
      event?.type
    );

  const userId =
    cleanText(
      event?.source
        ?.userId
    );

  if (
    userId
  ) {
    try {
      await saveLineUser(
        userId,
        env
      );

    } catch (error) {
      console.error(
        "Save LINE user failed:",
        error?.message ||
        String(
          error
        )
      );
    }
  }

  /*
   * FOLLOW
   */

  if (
    eventType ===
    "follow"
  ) {
    const replyToken =
      cleanText(
        event?.replyToken
      );

    if (
      !replyToken
    ) {
      return;
    }

    let lineLinkToken =
      "";

    if (
      userId
    ) {
      lineLinkToken =
        await createLineLinkToken(
          userId,
          env
        );
    }

    await replyLineMessage(
      replyToken,
      buildWelcomeLineMessage(
        lineLinkToken,
        env
      ),
      env
    );

    return;
  }

  /*
   * TEXT MESSAGE
   */

  if (
    eventType !==
      "message" ||
    event?.message?.type !==
      "text"
  ) {
    return;
  }

  const replyToken =
    cleanText(
      event?.replyToken
    );

  if (
    !replyToken
  ) {
    return;
  }

  let lineLinkToken =
    "";

  if (
    userId
  ) {
    try {
      lineLinkToken =
        await createLineLinkToken(
          userId,
          env
        );

    } catch (error) {
      console.error(
        "Create LINE link token failed:",
        error?.message ||
        String(
          error
        )
      );
    }
  }

  const replyText =
    buildLineReplyMessage(
      cleanText(
        event?.message?.text
      ),
      lineLinkToken,
      env
    );

  await replyLineMessage(
    replyToken,
    replyText,
    env
  );
}


async function saveLineUser(
  lineUserId,
  env
) {
  if (
    !lineUserId ||
    !env.DB
  ) {
    return;
  }

  const now =
    new Date()
      .toISOString();

  await env.DB.prepare(`
    INSERT INTO line_users (
      line_user_id,
      order_id,
      created_at,
      updated_at
    )
    VALUES (
      ?, NULL, ?, ?
    )

    ON CONFLICT(line_user_id)
    DO UPDATE SET
      updated_at =
        excluded.updated_at
  `)
    .bind(
      lineUserId,
      now,
      now
    )
    .run();
}


/*
 * =========================================
 * LINE MESSAGES
 * =========================================
 */

function buildWelcomeLineMessage(
  lineLinkToken,
  env
) {
  const paymentUrl =
    createPaymentPageUrl(
      lineLinkToken,
      env
    );

  let message =
    "ยินดีต้อนรับสู่ LIVEHUB TH 🎵\n\n" +
    "ศูนย์รวม LIVE CONCERT และ REPLAY CONCERT\n\n";

  if (
    paymentUrl
  ) {
    message +=
      "เลือกคอนเสิร์ตและชำระเงินได้ที่\n" +
      paymentUrl +
      "\n\n";
  }

  message +=
    "หลังระบบตรวจสอบสลิปสำเร็จ รหัสเข้าชมจะถูกส่งกลับมาทาง LINE บัญชีนี้\n\n" +
    "กรุณาเก็บรหัสเข้าชมเป็นความลับ และไม่ส่งต่อให้ผู้อื่น";

  return message;
}


function buildLineReplyMessage(
  userMessage,
  lineLinkToken,
  env
) {
  const normalized =
    String(
      userMessage ||
      ""
    )
      .trim()
      .toLowerCase();

  if (
    [
      "test",
      "ทดสอบ",
      "ทดสอบ webhook",
    ].includes(
      normalized
    )
  ) {
    return (
      "LIVEHUB TH ✅\n\n" +
      "ระบบ LINE Messaging API เชื่อมต่อสำเร็จแล้ว"
    );
  }

  const wantsPurchase =
    normalized.includes(
      "ซื้อ"
    ) ||
    normalized.includes(
      "ชำระ"
    ) ||
    normalized.includes(
      "คอนเสิร์ต"
    ) ||
    normalized.includes(
      "live"
    ) ||
    normalized.includes(
      "รีเพลย์"
    ) ||
    normalized.includes(
      "replay"
    );

  if (
    wantsPurchase
  ) {
    const paymentUrl =
      createPaymentPageUrl(
        lineLinkToken,
        env
      );

    if (
      paymentUrl
    ) {
      return (
        "LIVEHUB TH 🎵\n\n" +
        "เลือก LIVE CONCERT หรือ REPLAY CONCERT ได้จากลิงก์ด้านล่าง\n\n" +
        paymentUrl +
        "\n\n" +
        "หลังชำระเงินและตรวจสอบสลิปสำเร็จ ระบบจะส่งรหัสเข้าชมกลับมาที่ LINE บัญชีนี้อัตโนมัติ\n\n" +
        "ลิงก์นี้เป็นลิงก์เฉพาะของคุณ กรุณาอย่าส่งต่อ"
      );
    }

    return (
      "LIVEHUB TH 🎵\n\n" +
      "บัญชี LINE ของคุณเชื่อมต่อกับระบบแล้ว\n\n" +
      "แต่ระบบยังไม่ได้ตั้งค่า PAYMENT_PAGE_URL กรุณาติดต่อแอดมิน"
    );
  }

  if (
    normalized.includes(
      "รหัส"
    )
  ) {
    return (
      "LIVEHUB TH 🔐\n\n" +
      "เมื่อชำระเงินและระบบตรวจสอบสลิปสำเร็จ รหัสเข้าชมจะถูกส่งมาที่ LINE บัญชีนี้อัตโนมัติ\n\n" +
      "หากชำระเงินแล้วแต่ยังไม่ได้รับรหัส กรุณาติดต่อแอดมิน"
    );
  }

  return (
    "LIVEHUB TH 🎵\n\n" +
    "พิมพ์คำว่า “ซื้อ” เพื่อเลือก LIVE CONCERT หรือ REPLAY CONCERT\n\n" +
    "พิมพ์คำว่า “รหัส” หากต้องการข้อมูลเกี่ยวกับรหัสเข้าชม"
  );
}


function createPaymentPageUrl(
  lineLinkToken,
  env
) {
  const base =
    cleanText(
      env.PAYMENT_PAGE_URL
    );

  if (
    !base
  ) {
    return "";
  }

  if (
    !lineLinkToken
  ) {
    return base;
  }

  return (
    base +
    (
      base.includes("?")
        ? "&"
        : "?"
    ) +
    "lineLinkToken=" +
    encodeURIComponent(
      lineLinkToken
    )
  );
}


/*
 * =========================================
 * LINE REPLY
 * =========================================
 */

async function replyLineMessage(
  replyToken,
  text,
  env
) {
  if (
    !env.LINE_CHANNEL_ACCESS_TOKEN
  ) {
    throw new Error(
      "LINE_CHANNEL_ACCESS_TOKEN is not configured"
    );
  }

  if (
    !replyToken
  ) {
    throw new Error(
      "LINE reply token is missing"
    );
  }

  const response =
    await fetch(
      "https://api.line.me/v2/bot/message/reply",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            "Bearer " +
            env.LINE_CHANNEL_ACCESS_TOKEN,
        },

        body:
          JSON.stringify({
            replyToken,

            messages: [
              {
                type:
                  "text",

                text:
                  String(
                    text ||
                    ""
                  ).slice(
                    0,
                    5000
                  ),
              },
            ],
          }),
      }
    );

  if (
    response.ok
  ) {
    return true;
  }

  const responseText =
    await safeResponseText(
      response
    );

  throw new Error(
    "LINE reply failed " +
    response.status +
    (
      responseText
        ? " - " +
          responseText
        : ""
    )
  );
}


/*
 * =========================================
 * LINE PUSH
 * =========================================
 */

async function pushLineMessage(
  lineUserId,
  text,
  env
) {
  if (
    !env.LINE_CHANNEL_ACCESS_TOKEN
  ) {
    throw new Error(
      "LINE_CHANNEL_ACCESS_TOKEN is not configured"
    );
  }

  if (
    !lineUserId
  ) {
    throw new Error(
      "LINE user ID is missing"
    );
  }

  const response =
    await fetch(
      "https://api.line.me/v2/bot/message/push",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            "Bearer " +
            env.LINE_CHANNEL_ACCESS_TOKEN,
        },

        body:
          JSON.stringify({
            to:
              lineUserId,

            messages: [
              {
                type:
                  "text",

                text:
                  String(
                    text ||
                    ""
                  ).slice(
                    0,
                    5000
                  ),
              },
            ],
          }),
      }
    );

  if (
    response.ok
  ) {
    return true;
  }

  const responseText =
    await safeResponseText(
      response
    );

  throw new Error(
    "LINE push failed " +
    response.status +
    (
      responseText
        ? " - " +
          responseText
        : ""
    )
  );
}


/*
 * =========================================
 * SEND ACCESS CODE TO LINE
 * =========================================
 */

async function pushApprovedOrderToLine(
  lineUserId,
  orderData,
  env
) {
  let concertTitle =
    "";

  if (
    orderData.concertId
  ) {
    const concert =
      await env.DB.prepare(`
        SELECT
          title
        FROM concerts
        WHERE id = ?
        LIMIT 1
      `)
        .bind(
          orderData.concertId
        )
        .first();

    concertTitle =
      cleanText(
        concert?.title
      );
  }

  const expiresText =
    formatThaiDateTime(
      orderData
        .accessExpiresAt
    );

  const liveText =
    formatThaiDateTime(
      orderData
        .liveStartsAt
    );

  const isReplayOnly =
    orderData.accessType ===
    "replay";

  const sessionNames =
    Array.isArray(
      orderData.sessionNames
    )
      ? orderData
          .sessionNames
          .map(
            cleanText
          )
          .filter(
            Boolean
          )
      : [];

  let rightsText =
    "";

  if (
    isReplayOnly &&
    sessionNames.length >
    0
  ) {
    rightsText =
      "สิทธิ์รับชม: " +
      sessionNames.join(
        ", "
      ) +
      "\n";

  } else if (
    orderData.sessionName
  ) {
    rightsText =
      "รอบ: " +
      orderData.sessionName +
      "\n";
  }

  const typeText =
    orderData.accessType ===
      "replay"

      ? "REPLAY CONCERT"

      : orderData.accessType ===
        "live_replay"

        ? "LIVE + REPLAY"

        : "LIVE CONCERT";

  const message =
    "LIVEHUB TH ✅\n\n" +
    "ตรวจสอบการชำระเงินเรียบร้อยแล้ว\n\n" +

    (
      concertTitle
        ? "คอนเสิร์ต: " +
          concertTitle +
          "\n"
        : ""
    ) +

    "ประเภท: " +
    typeText +
    "\n" +

    rightsText +

    (
      !isReplayOnly &&
      liveText
        ? "เริ่มแสดง: " +
          liveText +
          "\n"
        : ""
    ) +

    (
      orderData.packageName
        ? "แพ็กเกจ: " +
          orderData.packageName +
          "\n"
        : ""
    ) +

    "\n🔐 รหัสเข้าชม\n" +
    orderData.accessCode +
    "\n\n" +

    (
      expiresText
        ? "ใช้ได้ถึง: " +
          expiresText +
          "\n\n"
        : ""
    ) +

    "กรุณาเก็บรหัสนี้เป็นความลับ และไม่ส่งต่อให้ผู้อื่น";

  await pushLineMessage(
    lineUserId,
    message,
    env
  );

  return true;
}


/*
 * =========================================
 * LINE LINK TOKEN
 * =========================================
 */

async function createLineLinkToken(
  lineUserId,
  env
) {
  if (
    !env.LINE_CHANNEL_SECRET
  ) {
    throw new Error(
      "LINE_CHANNEL_SECRET is not configured"
    );
  }

  if (
    !lineUserId
  ) {
    throw new Error(
      "LINE user ID is missing"
    );
  }

  const payload = {
    uid:
      lineUserId,

    exp:
      Date.now() +
      30 *
      60 *
      1000,
  };

  const payloadEncoded =
    textToBase64Url(
      JSON.stringify(
        payload
      )
    );

  const signature =
    await signLineLinkPayload(
      payloadEncoded,
      env.LINE_CHANNEL_SECRET
    );

  return (
    payloadEncoded +
    "." +
    signature
  );
}


async function verifyLineLinkToken(
  token,
  env
) {
  if (
    !token ||
    !env.LINE_CHANNEL_SECRET
  ) {
    return {
      ok: false,

      message:
        "ข้อมูลเชื่อมต่อ LINE ไม่ถูกต้อง",
    };
  }

  const parts =
    String(
      token
    ).split(
      "."
    );

  if (
    parts.length !==
    2
  ) {
    return {
      ok: false,

      message:
        "ลิงก์ LINE ไม่ถูกต้อง",
    };
  }

  const [
    payloadEncoded,
    receivedSignature,
  ] = parts;

  if (
    !payloadEncoded ||
    !receivedSignature
  ) {
    return {
      ok: false,

      message:
        "ลิงก์ LINE ไม่ถูกต้อง",
    };
  }

  const expectedSignature =
    await signLineLinkPayload(
      payloadEncoded,
      env.LINE_CHANNEL_SECRET
    );

  if (
    !constantTimeEqual(
      expectedSignature,
      receivedSignature
    )
  ) {
    return {
      ok: false,

      message:
        "ลิงก์ LINE ไม่ถูกต้อง",
    };
  }

  let payload;

  try {
    payload =
      JSON.parse(
        base64UrlToText(
          payloadEncoded
        )
      );

  } catch {
    return {
      ok: false,

      message:
        "ข้อมูลลิงก์ LINE ไม่ถูกต้อง",
    };
  }

  const lineUserId =
    cleanText(
      payload?.uid
    );

  const expiresAt =
    Number(
      payload?.exp
    );

  if (
    !lineUserId ||
    !Number.isFinite(
      expiresAt
    )
  ) {
    return {
      ok: false,

      message:
        "ข้อมูลลิงก์ LINE ไม่ครบ",
    };
  }

  if (
    Date.now() >
    expiresAt
  ) {
    return {
      ok: false,

      message:
        "ลิงก์ LINE หมดอายุแล้ว กรุณากลับไปที่ LINE แล้วพิมพ์คำว่า ซื้อ อีกครั้ง",
    };
  }

  return {
    ok: true,
    lineUserId,
  };
}


async function signLineLinkPayload(
  value,
  channelSecret
) {
  const encoder =
    new TextEncoder();

  const derivedKeyBytes =
    await crypto.subtle.digest(
      "SHA-256",

      encoder.encode(
        String(
          channelSecret
        ) +
        "|LIVEHUB-LINE-LINK-V1"
      )
    );

  const key =
    await crypto.subtle.importKey(
      "raw",
      derivedKeyBytes,
      {
        name:
          "HMAC",

        hash:
          "SHA-256",
      },
      false,
      [
        "sign",
      ]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(
        value
      )
    );

  return arrayBufferToBase64Url(
    signature
  );
}


async function verifyLineSignature(
  bodyText,
  receivedSignature,
  channelSecret
) {
  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(
        channelSecret
      ),
      {
        name:
          "HMAC",

        hash:
          "SHA-256",
      },
      false,
      [
        "sign",
      ]
    );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(
        bodyText
      )
    );

  return constantTimeEqual(
    arrayBufferToBase64(
      signatureBuffer
    ),
    receivedSignature
  );
}

/*
 * =========================================
 * NORMALIZATION
 * =========================================
 */

function normalizeConcertInput(
  body = {}
) {
  return {
    title:
      cleanText(
        body.title
      ),

    description:
      cleanOptionalText(
        body.description
      ),

    coverImageUrl:
      cleanOptionalText(
        body.coverImageUrl ??
        body.cover_image_url
      ),

    liveStartsAt:
      normalizeDate(
        body.liveStartsAt ??
        body.live_starts_at
      ),

    liveEndsAt:
      normalizeDate(
        body.liveEndsAt ??
        body.live_ends_at
      ),

    status:
      normalizeConcertStatus(
        body.status
      ),
  };
}


function validateConcertInput(
  input
) {
  if (
    !input.title
  ) {
    return "กรุณากรอกชื่อคอนเสิร์ต";
  }

  if (
    !input.liveStartsAt ||
    !input.liveEndsAt
  ) {
    return "กรุณากำหนดวันเวลาเริ่มและจบ";
  }

  if (
    new Date(
      input.liveEndsAt
    ).getTime() <=
    new Date(
      input.liveStartsAt
    ).getTime()
  ) {
    return "เวลาจบต้องอยู่หลังเวลาเริ่ม";
  }

  if (
    !input.status
  ) {
    return "สถานะคอนเสิร์ตไม่ถูกต้อง";
  }

  return "";
}


/*
 * =========================================
 * SESSION NORMALIZATION
 * =========================================
 */

function normalizeSessionInput(
  body = {}
) {
  return {
    concertId:
      cleanText(
        body.concertId ??
        body.concert_id
      ),

    name:
      cleanText(
        body.name
      ),

    liveStartsAt:
      normalizeDate(
        body.liveStartsAt ??
        body.live_starts_at
      ),

    liveEndsAt:
      normalizeDate(
        body.liveEndsAt ??
        body.live_ends_at
      ),

    sortOrder:
      normalizeNonNegativeInteger(
        body.sortOrder ??
        body.sort_order,
        0
      ),

    isActive:
      normalizeBooleanNumber(
        body.isActive ??
        body.is_active,
        1
      ),
  };
}


function validateSessionInput(
  input
) {
  if (
    !input.concertId ||
    !input.name
  ) {
    return "กรุณากรอกข้อมูลวันแสดงให้ครบ";
  }

  if (
    !input.liveStartsAt ||
    !input.liveEndsAt
  ) {
    return "กรุณากำหนดเวลาเริ่มและจบ";
  }

  if (
    new Date(
      input.liveEndsAt
    ).getTime() <=
    new Date(
      input.liveStartsAt
    ).getTime()
  ) {
    return "เวลาจบต้องอยู่หลังเวลาเริ่ม";
  }

  return "";
}


/*
 * =========================================
 * PACKAGE NORMALIZATION
 * =========================================
 */

function normalizePackageInput(
  body = {}
) {
  const accessType =
    normalizeAccessType(
      body.accessType ??
      body.access_type
    );

  return {
    concertId:
      cleanText(
        body.concertId ??
        body.concert_id
      ),

    name:
      cleanText(
        body.name
      ),

    price:
      normalizePrice(
        body.price
      ),

    accessType,

    replayDays:
      normalizeReplayDays(
        body.replayDays ??
        body.replay_days,
        accessType
      ),

    replayMonths:
      normalizeReplayMonths(
        body.replayMonths ??
        body.replay_months,
        accessType
      ),

    hasEcard:
      normalizeBooleanNumber(
        body.hasEcard ??
        body.has_ecard,
        0
      ),

    videoQuality:
      normalizeVideoQuality(
        body.videoQuality ??
        body.video_quality
      ),

    sessionSelectionMode:
  (
    body.sessionSelectionMode === undefined &&
    body.session_selection_mode === undefined
  )
    ? "single"
    : normalizeSessionSelectionMode(
        body.sessionSelectionMode ??
        body.session_selection_mode
      ),

    sessionIds:
      normalizeIdArray(
        body.sessionIds ??
        body.session_ids
      ),

    isActive:
      normalizeBooleanNumber(
        body.isActive ??
        body.is_active,
        1
      ),
  };
}


function normalizeSessionSelectionMode(
  value
) {
  const mode =
    String(
      value ??
      ""
    )
      .trim()
      .toLowerCase();

  return [
    "single",
    "all",
  ].includes(
    mode
  )
    ? mode
    : "";
}


function validatePackageInput(
  input
) {
  if (
    !input.concertId
  ) {
    return "ไม่พบรหัสคอนเสิร์ต";
  }

  if (
    !input.name
  ) {
    return "กรุณากรอกชื่อแพ็กเกจ";
  }

  if (
    input.price ===
    null
  ) {
    return "ราคาแพ็กเกจไม่ถูกต้อง";
  }

  if (
    !input.accessType
  ) {
    return "ประเภทสิทธิ์ไม่ถูกต้อง";
  }

  if (
    input.replayDays ===
    null
  ) {
    return "จำนวนวัน Replay ไม่ถูกต้อง";
  }

  if (
    input.replayMonths ===
    null
  ) {
    return "จำนวนเดือน Replay ไม่ถูกต้อง";
  }

  if (
    [
      "live_replay",
      "replay",
    ].includes(
      input.accessType
    ) &&
    Number(
      input.replayDays
    ) < 1 &&
    Number(
      input.replayMonths
    ) < 1
  ) {
    return (
      input.accessType ===
      "replay"

        ? "แพ็กเกจ REPLAY ต้องมีจำนวนวันหรือจำนวนเดือน Replay"

        : "แพ็กเกจ LIVE + REPLAY ต้องมีจำนวนวันหรือจำนวนเดือน Replay"
    );
  }

  if (
    Number(
      input.replayDays
    ) > 0 &&
    Number(
      input.replayMonths
    ) > 0
  ) {
    return "กรุณากำหนด Replay เป็นจำนวนวันหรือจำนวนเดือนอย่างใดอย่างหนึ่ง";
  }

  if (
    !input.videoQuality
  ) {
    return "ความคมชัดไม่ถูกต้อง";
  }

  if (
    ![
      "single",
      "all",
    ].includes(
      input.sessionSelectionMode
    )
  ) {
    return "รูปแบบการเลือกวันไม่ถูกต้อง";
  }

  return "";
}


/*
 * =========================================
 * PRICE
 * =========================================
 */

function normalizePrice(
  value
) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {
    return null;
  }

  const price =
    Number(
      value
    );

  if (
    !Number.isInteger(
      price
    ) ||
    price < 0 ||
    price > 1000000
  ) {
    return null;
  }

  return price;
}


/*
 * =========================================
 * ACCESS TYPE
 * =========================================
 */

function normalizeAccessType(
  value
) {
  const accessType =
    String(
      value ||
      "live"
    )
      .trim()
      .toLowerCase();

  const normalized =
    accessType ===
    "live+replay"
      ? "live_replay"
      : accessType;

  return [
    "live",
    "live_replay",
    "replay",
  ].includes(
    normalized
  )
    ? normalized
    : "";
}


/*
 * =========================================
 * REPLAY
 * =========================================
 */

function normalizeReplayDays(
  value,
  accessType
) {
  if (
    accessType ===
    "live"
  ) {
    return 0;
  }

  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {
    return 0;
  }

  const days =
    Number(
      value
    );

  if (
    !Number.isInteger(
      days
    ) ||
    days < 0 ||
    days > 3650
  ) {
    return null;
  }

  return days;
}


function normalizeReplayMonths(
  value,
  accessType
) {
  if (
    accessType ===
    "live"
  ) {
    return 0;
  }

  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {
    return 0;
  }

  const months =
    Number(
      value
    );

  if (
    !Number.isInteger(
      months
    ) ||
    months < 0 ||
    months > 120
  ) {
    return null;
  }

  return months;
}


/*
 * =========================================
 * VIDEO QUALITY
 * =========================================
 */

function normalizeVideoQuality(
  value
) {
  const quality =
    String(
      value ||
      "1080p"
    )
      .trim()
      .toLowerCase();

  if (
    ![
      "720p",
      "1080p",
      "4k",
    ].includes(
      quality
    )
  ) {
    return "";
  }

  return quality ===
    "4k"
      ? "4K"
      : quality;
}


/*
 * =========================================
 * INTEGER
 * =========================================
 */

function normalizeNonNegativeInteger(
  value,
  defaultValue
) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {
    return defaultValue;
  }

  const number =
    Number(
      value
    );

  return (
    Number.isInteger(
      number
    ) &&
    number >= 0
  )
    ? number
    : defaultValue;
}


function normalizePositiveInteger(
  value,
  defaultValue
) {
  const number =
    Number(
      value
    );

  return (
    Number.isInteger(
      number
    ) &&
    number > 0
  )
    ? number
    : defaultValue;
}


/*
 * =========================================
 * BOOLEAN
 * =========================================
 */

function normalizeBooleanNumber(
  value,
  defaultValue
) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {
    return defaultValue;
  }

  if (
    [
      true,
      1,
      "1",
      "true",
      "on",
    ].includes(
      value
    )
  ) {
    return 1;
  }

  return 0;
}


/*
 * =========================================
 * ID ARRAY
 * =========================================
 */

function normalizeIdArray(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return [
    ...new Set(
      value
        .map(
          item =>
            String(
              item ??
              ""
            ).trim()
        )
        .filter(
          Boolean
        )
    ),
  ];
}


/*
 * =========================================
 * DATE
 * =========================================
 */

function normalizeDate(
  value
) {
  const text =
    String(
      value ??
      ""
    ).trim();

  if (
    !text
  ) {
    return "";
  }

  const date =
    new Date(
      text
    );

  return Number.isNaN(
    date.getTime()
  )
    ? ""
    : date
        .toISOString();
}


/*
 * =========================================
 * CONCERT STATUS
 * =========================================
 */

function normalizeConcertStatus(
  value
) {
  const status =
    String(
      value ||
      "draft"
    ).trim();

  return [
    "draft",
    "on_sale",
    "live",
    "ended",
    "hidden",
  ].includes(
    status
  )
    ? status
    : "";
}
/*
 * =========================================
 * IDS
 * =========================================
 */

function createId(
  prefix
) {
  const timePart =
    Date.now()
      .toString(
        36
      )
      .toUpperCase();

  const randomPart =
    crypto
      .randomUUID()
      .replaceAll(
        "-",
        ""
      )
      .slice(
        0,
        8
      )
      .toUpperCase();

  return (
    prefix +
    "-" +
    timePart +
    "-" +
    randomPart
  );
}


function createAccessCode() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const bytes =
    new Uint8Array(
      10
    );

  crypto.getRandomValues(
    bytes
  );

  let code =
    "";

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    code +=
      alphabet[
        bytes[i] %
        alphabet.length
      ];
  }

  return (
    code.slice(
      0,
      5
    ) +
    "-" +
    code.slice(
      5
    )
  );
}


function createViewingSessionToken() {
  const bytes =
    new Uint8Array(
      32
    );

  crypto.getRandomValues(
    bytes
  );

  return base64Url(
    bytes
  );
}


/*
 * =========================================
 * ADMIN AUTH
 * =========================================
 */

function isAdmin(
  request,
  env
) {
  if (
    !env.ADMIN_TOKEN
  ) {
    return false;
  }

  const authorization =
    cleanText(
      request.headers.get(
        "Authorization"
      )
    );

  const headerToken =
    cleanText(
      request.headers.get(
        "X-Admin-Token"
      )
    );

  let suppliedToken =
    headerToken;

  if (
    authorization
      .toLowerCase()
      .startsWith(
        "bearer "
      )
  ) {
    suppliedToken =
      cleanText(
        authorization.slice(
          7
        )
      );
  }

  if (
    !suppliedToken
  ) {
    return false;
  }

  return constantTimeEqual(
    suppliedToken,
    String(
      env.ADMIN_TOKEN
    )
  );
}


/*
 * =========================================
 * PATH HELPERS
 * =========================================
 */

function getPathId(
  path,
  prefix
) {
  const remainder =
    path.startsWith(
      prefix
    )
      ? path.slice(
          prefix.length
        )
      : "";

  if (
    !remainder ||
    remainder.includes(
      "/"
    )
  ) {
    return "";
  }

  try {
    return decodeURIComponent(
      remainder
    ).trim();

  } catch {
    return "";
  }
}


function parseAdminOrderRoute(
  path
) {
  const prefix =
    "/api/admin/orders/";

  if (
    !path.startsWith(
      prefix
    )
  ) {
    return null;
  }

  const remainder =
    path.slice(
      prefix.length
    );

  if (
    !remainder
  ) {
    return null;
  }

  const parts =
    remainder
      .split("/")
      .filter(
        Boolean
      );

  if (
    parts.length < 1 ||
    parts.length > 2
  ) {
    return null;
  }

  let orderId;

  try {
    orderId =
      decodeURIComponent(
        parts[0]
      ).trim();

  } catch {
    return null;
  }

  if (
    !orderId
  ) {
    return null;
  }

  const action =
    parts.length ===
    1
      ? "detail"
      : parts[1];

  const allowed = [
    "detail",
    "status",
    "cancel",
    "reactivate",
    "regenerate-code",
  ];

  if (
    !allowed.includes(
      action
    )
  ) {
    return null;
  }

  return {
    orderId,
    action,
  };
}


/*
 * =========================================
 * RESPONSE MAPPERS
 * =========================================
 */

function mapConcert(
  concert
) {
  return {
    id:
      concert?.id ||
      "",

    title:
      concert?.title ||
      "",

    description:
      concert?.description ||
      "",

    coverImageUrl:
      concert
        ?.cover_image_url ||
      "",

    liveStartsAt:
      concert
        ?.live_starts_at ||
      null,

    liveEndsAt:
      concert
        ?.live_ends_at ||
      null,

    status:
      concert?.status ||
      "",
  };
}


function mapSelectedSession(
  order
) {
  return {
    id:
      order
        ?.selected_session_id ||
      "",

    name:
      order
        ?.selected_session_name ||
      "",

    liveStartsAt:
      order
        ?.selected_session_starts_at ||
      null,

    liveEndsAt:
      order
        ?.selected_session_ends_at ||
      null,
  };
}


function mapEntitledSessions(
  sessions
) {
  return (
    sessions ||
    []
  ).map(
    session => ({
      id:
        session.session_id ||
        session.id ||
        "",

      name:
        session.session_name ||
        session.name ||
        "",

      liveStartsAt:
        session.live_starts_at ||
        null,

      liveEndsAt:
        session.live_ends_at ||
        null,
    })
  );
}


function mapOrderPackage(
  order
) {
  return {
    id:
      order?.package_id ||
      "",

    name:
      order?.package_name ||
      "",

    accessType:
      order?.access_type ||
      "live",

    replayDays:
      Number(
        order?.replay_days ||
        0
      ),

    replayMonths:
      Number(
        order?.replay_months ||
        0
      ),

    hasEcard:
      Number(
        order?.has_ecard
      ) === 1,

    videoQuality:
      order?.video_quality ||
      "1080p",
  };
}


/*
 * =========================================
 * REQUEST / RESPONSE HELPERS
 * =========================================
 */

async function readJson(
  request
) {
  try {
    return await request.json();

  } catch {
    return {};
  }
}


function cleanText(
  value
) {
  return String(
    value ??
    ""
  ).trim();
}


function cleanOptionalText(
  value
) {
  const text =
    cleanText(
      value
    );

  return (
    text ||
    null
  );
}


function jsonResponse(
  data,
  status = 200,
  corsHeaders = {}
) {
  return new Response(
    JSON.stringify(
      data
    ),
    {
      status,

      headers: {
        ...corsHeaders,

        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control":
          "no-store",

        "X-Content-Type-Options":
          "nosniff",
      },
    }
  );
}


function errorResponse(
  message,
  status = 400,
  corsHeaders = {}
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


/*
 * =========================================
 * IMAGE EXTENSION
 * =========================================
 */

function getImageExtension(
  contentType
) {
  const extensions = {
    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp",

    "image/gif":
      "gif",
  };

  return (
    extensions[
      contentType
    ] ||
    "jpg"
  );
}


/*
 * =========================================
 * BASE64
 * =========================================
 */

function arrayBufferToBase64(
  buffer
) {
  const bytes =
    new Uint8Array(
      buffer
    );

  let binary =
    "";

  for (
    let index = 0;
    index < bytes.length;
    index++
  ) {
    binary +=
      String.fromCharCode(
        bytes[index]
      );
  }

  return btoa(
    binary
  );
}


function arrayBufferToBase64Url(
  buffer
) {
  return arrayBufferToBase64(
    buffer
  )
    .replaceAll(
      "+",
      "-"
    )
    .replaceAll(
      "/",
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}


function base64Url(
  bytes
) {
  let binary =
    "";

  for (
    let index = 0;
    index < bytes.length;
    index++
  ) {
    binary +=
      String.fromCharCode(
        bytes[index]
      );
  }

  return btoa(
    binary
  )
    .replaceAll(
      "+",
      "-"
    )
    .replaceAll(
      "/",
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}


function textToBase64Url(
  text
) {
  return base64Url(
    new TextEncoder()
      .encode(
        String(
          text
        )
      )
  );
}


function base64UrlToText(
  value
) {
  let base64 =
    String(
      value ||
      ""
    )
      .replaceAll(
        "-",
        "+"
      )
      .replaceAll(
        "_",
        "/"
      );

  while (
    base64.length %
      4 !==
    0
  ) {
    base64 +=
      "=";
  }

  const binary =
    atob(
      base64
    );

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index < binary.length;
    index++
  ) {
    bytes[index] =
      binary.charCodeAt(
        index
      );
  }

  return new TextDecoder()
    .decode(
      bytes
    );
}


/*
 * =========================================
 * CONSTANT TIME
 * =========================================
 */

function constantTimeEqual(
  firstValue,
  secondValue
) {
  const first =
    String(
      firstValue ??
      ""
    );

  const second =
    String(
      secondValue ??
      ""
    );

  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  let difference =
    0;

  for (
    let index = 0;
    index < first.length;
    index++
  ) {
    difference |=
      first.charCodeAt(
        index
      ) ^
      second.charCodeAt(
        index
      );
  }

  return (
    difference === 0
  );
}


/*
 * =========================================
 * THAI DATE FORMAT
 * =========================================
 */

function formatThaiDateTime(
  value
) {
  if (
    !value
  ) {
    return "";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      "th-TH",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",

        timeZone:
          "Asia/Bangkok",
      }
    ).format(
      date
    );

  } catch {
    return date
      .toISOString();
  }
}


/*
 * =========================================
 * SAFE RESPONSE TEXT
 * =========================================
 */

async function safeResponseText(
  response
) {
  try {
    return await response.text();

  } catch {
    return "";
  }
}

/*
 * ==========================================
 * PUBLIC SITE SETTINGS
 * ==========================================
 */

async function getSiteSettings(
  env,
  corsHeaders
) {
  try {
    const row = await env.DB
      .prepare(`
        SELECT
          setting_key,
          setting_value
        FROM site_settings
      `)
      .all();

    const settings = {};

    for (const item of row.results || []) {
      settings[item.setting_key] =
        item.setting_value;
    }

    return jsonResponse(
      {
        ok: true,
        settings
      },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error(
      "getSiteSettings error:",
      error
    );

    return jsonResponse(
      {
        ok: false,
        error: "ไม่สามารถโหลดการตั้งค่าเว็บไซต์ได้"
      },
      500,
      corsHeaders
    );
  }
}

/*
 * =========================================
 * ADMIN SITE SETTINGS
 * =========================================
 */

async function getAdminSiteSettings(
  env,
  corsHeaders
) {
  try {
    const result =
      await env.DB.prepare(`
        SELECT
          setting_key,
          setting_value
        FROM site_settings
        ORDER BY setting_key ASC
      `).all();

    const settings = {};

    for (
      const item
      of (
        result.results ||
        []
      )
    ) {
      settings[
        item.setting_key
      ] =
        item.setting_value;
    }

    return jsonResponse(
      {
        success: true,
        ok: true,
        settings
      },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error(
      "getAdminSiteSettings error:",
      error
    );

    return errorResponse(
      "ไม่สามารถโหลดการตั้งค่าเว็บไซต์ได้",
      500,
      corsHeaders
    );
  }
}


/*
 * =========================================
 * UPDATE SITE SETTINGS
 * =========================================
 */

async function updateSiteSettings(
  request,
  env,
  corsHeaders
) {
  let body;

  try {
    body =
      await request.json();

  } catch {
    return errorResponse(
      "ข้อมูลการตั้งค่าไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const allowedKeys = [
    "logo_text",
    "logo_image_url",
    "hero_title",
    "hero_subtitle",
    "hero_background_url",
    "live_link",
    "replay_link",
    "package_link",
    "contact_link"
  ];

  const settings =
    body?.settings &&
    typeof body.settings ===
      "object"
      ? body.settings
      : body;

  if (
    !settings ||
    typeof settings !==
      "object" ||
    Array.isArray(
      settings
    )
  ) {
    return errorResponse(
      "ไม่พบข้อมูลการตั้งค่าเว็บไซต์",
      400,
      corsHeaders
    );
  }

  const entries =
    Object.entries(
      settings
    ).filter(
      ([key]) =>
        allowedKeys.includes(
          key
        )
    );

  if (
    entries.length ===
    0
  ) {
    return errorResponse(
      "ไม่มีข้อมูลที่สามารถบันทึกได้",
      400,
      corsHeaders
    );
  }

  try {
    const now =
      new Date()
        .toISOString();

    for (
      const [
        key,
        value
      ]
      of entries
    ) {
      const settingValue =
        cleanText(
          value
        );

      await env.DB.prepare(`
  INSERT INTO site_settings (
    setting_key,
    setting_value,
    created_at,
    updated_at
  )
  VALUES (
    ?, ?, ?, ?
  )

  ON CONFLICT(setting_key)
  DO UPDATE SET
    setting_value =
      excluded.setting_value,
    updated_at =
      excluded.updated_at
`)
  .bind(
    key,
    settingValue,
    now,
    now
  )
  .run();
 }

    const result =
      await env.DB.prepare(`
        SELECT
          setting_key,
          setting_value
        FROM site_settings
        ORDER BY setting_key ASC
      `).all();

    const savedSettings = {};

    for (
      const item
      of (
        result.results ||
        []
      )
    ) {
      savedSettings[
        item.setting_key
      ] =
        item.setting_value;
    }

    return jsonResponse(
      {
        success: true,
        ok: true,

        settings:
          savedSettings,

        message:
          "บันทึกการตั้งค่าเว็บไซต์สำเร็จ"
      },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error(
      "updateSiteSettings error:",
      error
    );

    return errorResponse(
      "ไม่สามารถบันทึกการตั้งค่าเว็บไซต์ได้",
      500,
      corsHeaders
    );
  }
}

/*
 * =========================================
 * ADMIN SITE ASSET UPLOAD
 * =========================================
 */

async function uploadSiteAsset(
  request,
  env,
  corsHeaders
) {
  if (!env.SLIPS) {
    return errorResponse(
      "ไม่พบ R2 Storage",
      500,
      corsHeaders
    );
  }

  let formData;

  try {
    formData =
      await request.formData();
  } catch {
    return errorResponse(
      "ข้อมูลอัปโหลดไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const file =
    formData.get("file") ||
    formData.get("image");

  const assetType =
    cleanText(
      formData.get("type")
    ).toLowerCase();

  if (
    ![
      "logo",
      "hero-background"
    ].includes(assetType)
  ) {
    return errorResponse(
      "ประเภทภาพไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  if (
    !(file instanceof File) ||
    file.size === 0
  ) {
    return errorResponse(
      "กรุณาเลือกรูปภาพ",
      400,
      corsHeaders
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    return errorResponse(
      "รองรับเฉพาะ JPG, PNG, WEBP และ GIF",
      400,
      corsHeaders
    );
  }

  if (
    file.size >
    10 * 1024 * 1024
  ) {
    return errorResponse(
      "รูปต้องมีขนาดไม่เกิน 10 MB",
      400,
      corsHeaders
    );
  }

  const extension =
    getImageExtension(
      file.type
    );

  const assetKey =
    "site-assets/" +
    assetType +
    "-" +
    Date.now() +
    "-" +
    crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 12)
      .toLowerCase() +
    "." +
    extension;

  const fileBytes =
    await file.arrayBuffer();

  await env.SLIPS.put(
    assetKey,
    fileBytes,
    {
      httpMetadata: {
        contentType:
          file.type
      },

      customMetadata: {
        type:
          assetType,

        originalName:
          String(
            file.name || ""
          ).slice(
            0,
            200
          ),

        uploadedAt:
          new Date()
            .toISOString()
      }
    }
  );

  const assetUrl =
    new URL(
      request.url
    ).origin +
    "/api/site-asset/" +
    encodeURIComponent(
      assetKey
    );

  return jsonResponse(
    {
      success: true,
      ok: true,

      type:
        assetType,

      assetKey,

      url:
        assetUrl,

      message:
        "อัปโหลดรูปสำเร็จ"
    },
    201,
    corsHeaders
  );
}
