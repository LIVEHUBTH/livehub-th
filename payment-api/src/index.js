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
    const path = url.pathname;

    try {
      /*
       * =========================================
       * PUBLIC API
       * =========================================
       */

      if (
        path === "/api/concerts" &&
        request.method === "GET"
      ) {
        return await getPublicConcerts(
          env,
          corsHeaders
        );
      }

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
       * ADMIN AUTHENTICATION
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
  path.startsWith("/api/admin/packages/") &&
  request.method === "DELETE"
) {
  const packageId = getPathId(
    path,
    "/api/admin/packages/"
  );

  return await deletePackage(
    packageId,
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
        path.startsWith("/api/admin/concerts/") &&
        request.method === "POST"
      ) {
        const concertId = getPathId(
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
       * ADMIN CONCERT SESSIONS
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
        path.startsWith("/api/admin/sessions/") &&
        request.method === "POST"
      ) {
        const sessionId = getPathId(
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
        path.startsWith("/api/admin/packages/") &&
        request.method === "POST"
      ) {
        const packageId = getPathId(
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

      if (
        path.startsWith("/api/admin/slip/") &&
        request.method === "GET"
      ) {
        const orderId = getPathId(
          path,
          "/api/admin/slip/"
        );

        return await getSlip(
          orderId,
          env,
          corsHeaders
        );
      }

      if (
        path.startsWith("/api/admin/orders/") &&
        path.endsWith("/status") &&
        request.method === "POST"
      ) {
        const orderId = decodeURIComponent(
          path
            .replace("/api/admin/orders/", "")
            .replace("/status", "")
        ).trim();

        return await updateOrderStatus(
          orderId,
          request,
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
      console.error("Worker error:", error);

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
  env,
  corsHeaders
) {
  const concertsResult = await env.DB.prepare(
    `
    SELECT
      id,
      title,
      description,
      cover_image_url,
      live_starts_at,
      live_ends_at,
      status
    FROM concerts
    WHERE status IN ('on_sale', 'live')
    ORDER BY live_starts_at ASC
    `
  ).all();

  const concerts =
    concertsResult.results || [];

  for (const concert of concerts) {
    const sessionsResult = await env.DB.prepare(
      `
      SELECT
        id,
        name,
        live_starts_at,
        live_ends_at,
        sort_order
      FROM concert_sessions
      WHERE concert_id = ?
        AND is_active = 1
      ORDER BY sort_order ASC, live_starts_at ASC
      `
    )
      .bind(concert.id)
      .all();

    const packagesResult = await env.DB.prepare(
      `
      SELECT
        id,
        name,
        price,
        access_type,
        replay_days,
        replay_months,
        has_ecard,
        video_quality
      FROM packages
      WHERE concert_id = ?
        AND is_active = 1
      ORDER BY price ASC, created_at ASC
      `
    )
      .bind(concert.id)
      .all();

    concert.sessions =
      sessionsResult.results || [];

    concert.packages =
      packagesResult.results || [];

    for (const packageItem of concert.packages) {
      const linkedResult = await env.DB.prepare(
        `
        SELECT session_id
        FROM package_sessions
        WHERE package_id = ?
        `
      )
        .bind(packageItem.id)
        .all();

      packageItem.session_ids = (
        linkedResult.results || []
      ).map(
        item => item.session_id
      );

      packageItem.has_ecard =
        Number(packageItem.has_ecard) === 1
          ? 1
          : 0;

      packageItem.replay_months =
        Number(
          packageItem.replay_months || 0
        );

      packageItem.video_quality =
        packageItem.video_quality ||
        "1080p";
    }
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

/*
 * =========================================
 * CONCERT ADMIN
 * =========================================
 */

async function getAdminConcerts(
  env,
  corsHeaders
) {
  const result = await env.DB.prepare(
    `
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
    ORDER BY c.created_at DESC
    `
  ).all();

  return jsonResponse(
    {
      success: true,
      concerts:
        result.results || [],
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
  const body =
    await readJson(request);

  const title =
    cleanText(body.title);

  const description =
    cleanOptionalText(
      body.description
    );

  const coverImageUrl =
    cleanOptionalText(
      body.coverImageUrl
    );

  const liveStartsAt =
    normalizeDate(
      body.liveStartsAt
    );

  const liveEndsAt =
    normalizeDate(
      body.liveEndsAt
    );

  const status =
    normalizeConcertStatus(
      body.status
    );

  if (!title) {
    return errorResponse(
      "กรุณากรอกชื่อคอนเสิร์ต",
      400,
      corsHeaders
    );
  }

  if (
    !liveStartsAt ||
    !liveEndsAt
  ) {
    return errorResponse(
      "กรุณากำหนดวันเวลาเริ่มและจบ",
      400,
      corsHeaders
    );
  }

  if (
    new Date(liveEndsAt).getTime() <=
    new Date(liveStartsAt).getTime()
  ) {
    return errorResponse(
      "เวลาจบต้องอยู่หลังเวลาเริ่ม",
      400,
      corsHeaders
    );
  }

  if (!status) {
    return errorResponse(
      "สถานะคอนเสิร์ตไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const concertId =
    createId("CON");

  const now =
    new Date().toISOString();

  await env.DB.prepare(
    `
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      concertId,
      title,
      description,
      coverImageUrl,
      liveStartsAt,
      liveEndsAt,
      status,
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
    await env.DB.prepare(
      `
      SELECT id
      FROM concerts
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(concertId)
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบคอนเสิร์ต",
      404,
      corsHeaders
    );
  }

  const body =
    await readJson(request);

  const title =
    cleanText(body.title);

  const description =
    cleanOptionalText(
      body.description
    );

  const coverImageUrl =
    cleanOptionalText(
      body.coverImageUrl
    );

  const liveStartsAt =
    normalizeDate(
      body.liveStartsAt
    );

  const liveEndsAt =
    normalizeDate(
      body.liveEndsAt
    );

  const status =
    normalizeConcertStatus(
      body.status
    );

  if (!title) {
    return errorResponse(
      "กรุณากรอกชื่อคอนเสิร์ต",
      400,
      corsHeaders
    );
  }

  if (
    !liveStartsAt ||
    !liveEndsAt
  ) {
    return errorResponse(
      "กรุณากำหนดวันเวลาเริ่มและจบ",
      400,
      corsHeaders
    );
  }

  if (
    new Date(liveEndsAt).getTime() <=
    new Date(liveStartsAt).getTime()
  ) {
    return errorResponse(
      "เวลาจบต้องอยู่หลังเวลาเริ่ม",
      400,
      corsHeaders
    );
  }

  if (!status) {
    return errorResponse(
      "สถานะคอนเสิร์ตไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(
    `
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
    `
  )
    .bind(
      title,
      description,
      coverImageUrl,
      liveStartsAt,
      liveEndsAt,
      status,
      new Date().toISOString(),
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
    await env.DB.prepare(
      `
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
      ORDER BY sort_order ASC, live_starts_at ASC
      `
    )
      .bind(concertId)
      .all();

  return jsonResponse(
    {
      success: true,
      sessions:
        result.results || [],
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
  const body =
    await readJson(request);

  const concertId =
    cleanText(body.concertId);

  const name =
    cleanText(body.name);

  const liveStartsAt =
    normalizeDate(
      body.liveStartsAt
    );

  const liveEndsAt =
    normalizeDate(
      body.liveEndsAt
    );

  const sortOrder =
    normalizeNonNegativeInteger(
      body.sortOrder,
      0
    );

  const isActive =
    normalizeBooleanNumber(
      body.isActive,
      1
    );

  if (
    !concertId ||
    !name
  ) {
    return errorResponse(
      "กรุณากรอกข้อมูลวันแสดงให้ครบ",
      400,
      corsHeaders
    );
  }

  if (
    !liveStartsAt ||
    !liveEndsAt
  ) {
    return errorResponse(
      "กรุณากำหนดเวลาเริ่มและจบ",
      400,
      corsHeaders
    );
  }

  if (
    new Date(liveEndsAt).getTime() <=
    new Date(liveStartsAt).getTime()
  ) {
    return errorResponse(
      "เวลาจบต้องอยู่หลังเวลาเริ่ม",
      400,
      corsHeaders
    );
  }

  const concert =
    await env.DB.prepare(
      `
      SELECT id
      FROM concerts
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(concertId)
      .first();

  if (!concert) {
    return errorResponse(
      "ไม่พบคอนเสิร์ต",
      404,
      corsHeaders
    );
  }

  const sessionId =
    createId("DAY");

  const now =
    new Date().toISOString();

  await env.DB.prepare(
    `
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      sessionId,
      concertId,
      name,
      liveStartsAt,
      liveEndsAt,
      sortOrder,
      isActive,
      now,
      now
    )
    .run();

  await updateConcertTimeRange(
    concertId,
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
    await env.DB.prepare(
      `
      SELECT id, concert_id
      FROM concert_sessions
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(sessionId)
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบวันแสดง",
      404,
      corsHeaders
    );
  }

  const body =
    await readJson(request);

  const name =
    cleanText(body.name);

  const liveStartsAt =
    normalizeDate(
      body.liveStartsAt
    );

  const liveEndsAt =
    normalizeDate(
      body.liveEndsAt
    );

  const sortOrder =
    normalizeNonNegativeInteger(
      body.sortOrder,
      0
    );

  const isActive =
    normalizeBooleanNumber(
      body.isActive,
      1
    );

  if (
    !name ||
    !liveStartsAt ||
    !liveEndsAt
  ) {
    return errorResponse(
      "กรุณากรอกข้อมูลวันแสดงให้ครบ",
      400,
      corsHeaders
    );
  }

  if (
    new Date(liveEndsAt).getTime() <=
    new Date(liveStartsAt).getTime()
  ) {
    return errorResponse(
      "เวลาจบต้องอยู่หลังเวลาเริ่ม",
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(
    `
    UPDATE concert_sessions
    SET
      name = ?,
      live_starts_at = ?,
      live_ends_at = ?,
      sort_order = ?,
      is_active = ?,
      updated_at = ?
    WHERE id = ?
    `
  )
    .bind(
      name,
      liveStartsAt,
      liveEndsAt,
      sortOrder,
      isActive,
      new Date().toISOString(),
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
  const concertId = cleanText(
    url.searchParams.get("concertId")
  );

  let result;

  if (concertId) {
    result = await env.DB.prepare(
      `
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
        is_active,
        created_at,
        updated_at
      FROM packages
      WHERE concert_id = ?
      ORDER BY created_at ASC
      `
    )
      .bind(concertId)
      .all();
  } else {
    result = await env.DB.prepare(
      `
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
        is_active,
        created_at,
        updated_at
      FROM packages
      ORDER BY created_at DESC
      `
    ).all();
  }

  const packages = result.results || [];

  for (const packageItem of packages) {
    const linkedResult = await env.DB.prepare(
      `
      SELECT session_id
      FROM package_sessions
      WHERE package_id = ?
      ORDER BY created_at ASC
      `
    )
      .bind(packageItem.id)
      .all();

    packageItem.session_ids = (
      linkedResult.results || []
    ).map(item => item.session_id);

    packageItem.replay_months = Number(
      packageItem.replay_months || 0
    );

    packageItem.has_ecard =
      Number(packageItem.has_ecard) === 1
        ? 1
        : 0;

    packageItem.video_quality =
      packageItem.video_quality || "1080p";
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
  const body = await readJson(request);

  const concertId =
    cleanText(body.concertId);

  const name =
    cleanText(body.name);

  const price =
    normalizePrice(body.price);

  const accessType =
    normalizeAccessType(
      body.accessType
    );

  /*
   * รองรับระบบเดิม replayDays
   * และระบบใหม่ replayMonths
   */
  const replayMonths =
    normalizeReplayMonths(
      body.replayMonths,
      accessType
    );

  const replayDays =
    normalizeLegacyReplayDays(
      body.replayDays,
      accessType
    );

  const hasEcard =
    normalizeBooleanNumber(
      body.hasEcard,
      0
    );

  const videoQuality =
    normalizeVideoQuality(
      body.videoQuality
    );

  const isActive =
    normalizeBooleanNumber(
      body.isActive,
      1
    );

  const sessionIds =
    normalizeIdArray(
      body.sessionIds
    );

  const validationError =
    validatePackageInput(
      concertId,
      name,
      price,
      accessType,
      replayMonths,
      videoQuality
    );

  if (validationError) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  const concert =
    await env.DB.prepare(
      `
      SELECT id
      FROM concerts
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(concertId)
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
      concertId,
      sessionIds,
      env
    );

  if (!sessionsValid) {
    return errorResponse(
      "มีวันแสดงที่ไม่ได้อยู่ในคอนเสิร์ตนี้",
      400,
      corsHeaders
    );
  }

  if (sessionIds.length === 0) {
    return errorResponse(
      "กรุณาเลือกวันแสดงอย่างน้อย 1 วัน",
      400,
      corsHeaders
    );
  }

  const packageId =
    createId("PKG");

  const now =
    new Date().toISOString();

  await env.DB.prepare(
    `
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
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
    `
  )
    .bind(
      packageId,
      concertId,
      name,
      price,
      accessType,
      replayDays,
      replayMonths,
      hasEcard,
      videoQuality,
      isActive,
      now,
      now
    )
    .run();

  await replacePackageSessions(
    packageId,
    sessionIds,
    env
  );

  return jsonResponse(
    {
      success: true,
      packageId,
      package: {
        id: packageId,
        concertId,
        name,
        price,
        accessType,
        replayMonths,
        hasEcard,
        videoQuality,
        sessionIds,
        isActive,
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
    await env.DB.prepare(
      `
      SELECT
        id,
        concert_id
      FROM packages
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(packageId)
      .first();

  if (!existing) {
    return errorResponse(
      "ไม่พบแพ็กเกจ",
      404,
      corsHeaders
    );
  }

  const body =
    await readJson(request);

  const name =
    cleanText(body.name);

  const price =
    normalizePrice(body.price);

  const accessType =
    normalizeAccessType(
      body.accessType
    );

  const replayMonths =
    normalizeReplayMonths(
      body.replayMonths,
      accessType
    );

  const replayDays =
    normalizeLegacyReplayDays(
      body.replayDays,
      accessType
    );

  const hasEcard =
    normalizeBooleanNumber(
      body.hasEcard,
      0
    );

  const videoQuality =
    normalizeVideoQuality(
      body.videoQuality
    );

  const isActive =
    normalizeBooleanNumber(
      body.isActive,
      1
    );

  const sessionIds =
    normalizeIdArray(
      body.sessionIds
    );

  const validationError =
    validatePackageInput(
      existing.concert_id,
      name,
      price,
      accessType,
      replayMonths,
      videoQuality
    );

  if (validationError) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  const sessionsValid =
    await validateSessionsForConcert(
      existing.concert_id,
      sessionIds,
      env
    );

  if (!sessionsValid) {
    return errorResponse(
      "มีวันแสดงที่ไม่ได้อยู่ในคอนเสิร์ตนี้",
      400,
      corsHeaders
    );
  }

  if (sessionIds.length === 0) {
    return errorResponse(
      "กรุณาเลือกวันแสดงอย่างน้อย 1 วัน",
      400,
      corsHeaders
    );
  }

  await env.DB.prepare(
    `
    UPDATE packages
    SET
      name = ?,
      price = ?,
      access_type = ?,
      replay_days = ?,
      replay_months = ?,
      has_ecard = ?,
      video_quality = ?,
      is_active = ?,
      updated_at = ?
    WHERE id = ?
    `
  )
    .bind(
      name,
      price,
      accessType,
      replayDays,
      replayMonths,
      hasEcard,
      videoQuality,
      isActive,
      new Date().toISOString(),
      packageId
    )
    .run();

  await replacePackageSessions(
    packageId,
    sessionIds,
    env
  );

  return jsonResponse(
    {
      success: true,
      packageId,
      package: {
        id: packageId,
        concertId:
          existing.concert_id,
        name,
        price,
        accessType,
        replayMonths,
        hasEcard,
        videoQuality,
        sessionIds,
        isActive,
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

  const existingPackage =
    await env.DB.prepare(
      `
      SELECT
        id,
        name
      FROM packages
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(packageId)
      .first();

  if (!existingPackage) {
    return errorResponse(
      "ไม่พบแพ็กเกจ",
      404,
      corsHeaders
    );
  }

  const orderCount =
    await env.DB.prepare(
      `
      SELECT COUNT(*) AS total
      FROM orders
      WHERE package_id = ?
      `
    )
      .bind(packageId)
      .first();

  if (
    Number(orderCount?.total || 0) > 0
  ) {
    return errorResponse(
      "ไม่สามารถลบแพ็กเกจนี้ได้ เพราะมีรายการสั่งซื้ออยู่แล้ว ให้ปิดขายแทน",
      409,
      corsHeaders
    );
  }

  await env.DB.prepare(
    `
    DELETE FROM package_sessions
    WHERE package_id = ?
    `
  )
    .bind(packageId)
    .run();

  await env.DB.prepare(
    `
    DELETE FROM packages
    WHERE id = ?
    `
  )
    .bind(packageId)
    .run();

  return jsonResponse(
    {
      success: true,
      packageId,
      message:
        "ลบแพ็กเกจ " +
        existingPackage.name +
        " สำเร็จ"
    },
    200,
    corsHeaders
  );
}
/*
 * =========================================
 * PAYMENT
 * =========================================
 */

async function createPayment(
  request,
  env,
  corsHeaders
) {
  const formData =
    await request.formData();

  const packageId =
    cleanText(
      formData.get("packageId")
    );

  const legacyPackageNumber =
    cleanText(
      formData.get("packageNumber")
    );

  const submittedPrice =
    Number(
      formData.get("price")
    );

  const slip =
    formData.get("slip");

  let selectedPackage = null;

  let orderPackageNumber =
    legacyPackageNumber || "-";

  /*
   * =========================================
   * PACKAGE FROM DATABASE
   * =========================================
   */

  if (packageId) {
    selectedPackage =
      await env.DB.prepare(
        `
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
          p.is_active,
          c.status AS concert_status
        FROM packages p
        INNER JOIN concerts c
          ON c.id = p.concert_id
        WHERE p.id = ?
        LIMIT 1
        `
      )
        .bind(packageId)
        .first();

    if (
      !selectedPackage ||
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

    if (
      ![
        "on_sale",
        "live",
      ].includes(
        selectedPackage.concert_status
      )
    ) {
      return errorResponse(
        "คอนเสิร์ตนี้ยังไม่เปิดขาย",
        400,
        corsHeaders
      );
    }

    orderPackageNumber =
      packageId;
  } else {
    /*
     * =========================================
     * LEGACY PACKAGE SUPPORT
     * =========================================
     *
     * เก็บไว้เพื่อไม่ให้หน้าเก่าเสีย
     */

    const legacyPrices = {
      "1": 99,
      "2": 199,
      "3": 149,
      "4": 249,
    };

    if (
      !legacyPrices[
        legacyPackageNumber
      ]
    ) {
      return errorResponse(
        "ไม่พบข้อมูลแพ็กเกจ",
        400,
        corsHeaders
      );
    }

    const legacyHasEcard =
      ["3", "4"].includes(
        legacyPackageNumber
      )
        ? 1
        : 0;

    const legacyReplayMonths =
      ["3", "4"].includes(
        legacyPackageNumber
      )
        ? 6
        : 0;

    selectedPackage = {
      id: null,
      concert_id: null,
      name:
        "แพ็กเกจ " +
        legacyPackageNumber,
      price:
        legacyPrices[
          legacyPackageNumber
        ],
      access_type:
        ["3", "4"].includes(
          legacyPackageNumber
        )
          ? "live_replay"
          : "live",
      replay_days: 0,
      replay_months:
        legacyReplayMonths,
      has_ecard:
        legacyHasEcard,
      video_quality:
        "1080p",
    };
  }

  /*
   * =========================================
   * PRICE SECURITY CHECK
   * =========================================
   */

  if (
    !Number.isFinite(
      submittedPrice
    ) ||
    Number(
      selectedPackage.price
    ) !== submittedPrice
  ) {
    return errorResponse(
      "ราคาแพ็กเกจไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  /*
   * =========================================
   * SLIP VALIDATION
   * =========================================
   */

  const slipError =
    validateSlip(slip);

  if (slipError) {
    return errorResponse(
      slipError,
      400,
      corsHeaders
    );
  }

  const orderId =
    createId("LH");

  const extension =
    getImageExtension(
      slip.type
    );

  const slipKey =
    `slips/${orderId}.${extension}`;

  /*
   * =========================================
   * SAVE SLIP TO R2
   * =========================================
   */

  await env.SLIPS.put(
    slipKey,
    await slip.arrayBuffer(),
    {
      httpMetadata: {
        contentType:
          slip.type,
      },

      customMetadata: {
        orderId,

        packageId:
          selectedPackage.id ||
          "",

        price:
          String(
            selectedPackage.price
          ),

        replayMonths:
          String(
            selectedPackage
              .replay_months ||
            0
          ),

        hasEcard:
          String(
            Number(
              selectedPackage
                .has_ecard ||
              0
            )
          ),

        videoQuality:
          selectedPackage
            .video_quality ||
          "1080p",
      },
    }
  );

  /*
   * =========================================
   * SAVE ORDER SNAPSHOT
   * =========================================
   *
   * สำคัญ:
   * เราบันทึก replay / e-card / quality
   * ลง orders ด้วย
   *
   * ดังนั้นถ้าแอดมินแก้แพ็กเกจภายหลัง
   * สิทธิ์ของลูกค้าที่ซื้อไปแล้ว
   * จะไม่เปลี่ยนตาม
   */

  try {
    await env.DB.prepare(
      `
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
        video_quality
      )
      VALUES (
        ?, ?, ?, ?, 'pending', ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
      `
    )
      .bind(
        orderId,
        orderPackageNumber,
        selectedPackage.price,
        slipKey,
        new Date().toISOString(),

        selectedPackage
          .concert_id,

        selectedPackage.id,

        selectedPackage.name,

        selectedPackage
          .access_type,

        Number(
          selectedPackage
            .replay_days ||
          0
        ),

        Number(
          selectedPackage
            .replay_months ||
          0
        ),

        Number(
          selectedPackage
            .has_ecard ||
          0
        ),

        selectedPackage
          .video_quality ||
        "1080p"
      )
      .run();
  } catch (databaseError) {
    /*
     * ถ้าบันทึก D1 ไม่สำเร็จ
     * ลบสลิปออกจาก R2
     * ป้องกันไฟล์ค้าง
     */

    await env.SLIPS.delete(
      slipKey
    );

    throw databaseError;
  }

  return jsonResponse(
    {
      success: true,

      orderId,

      status:
        "pending",

      package: {
        id:
          selectedPackage.id,

        name:
          selectedPackage.name,

        price:
          Number(
            selectedPackage.price
          ),

        accessType:
          selectedPackage
            .access_type,

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

      message:
        "ส่งสลิปสำเร็จ กรุณารอการตรวจสอบการชำระเงิน",
    },
    201,
    corsHeaders
  );
}
/*
 * =========================================
 * ORDERS
 * =========================================
 */

async function getOrders(
  url,
  env,
  corsHeaders
) {
  const status =
    url.searchParams.get("status") ||
    "pending";

  const allowed = [
    "pending",
    "approved",
    "rejected",
    "all",
  ];

  if (!allowed.includes(status)) {
    return errorResponse(
      "สถานะไม่ถูกต้อง",
      400,
      corsHeaders
    );
  }

  const columns = `
    id,
    package_number,
    price,
    slip_key,
    status,
    created_at,
    access_code,
    approved_at,
    access_expires_at,
    concert_id,
    package_id,
    package_name,
    access_type,
    replay_days,
    replay_months,
    has_ecard,
    video_quality
  `;

  let result;

  if (status === "all") {
    result = await env.DB.prepare(
      `
      SELECT ${columns}
      FROM orders
      ORDER BY created_at DESC
      LIMIT 100
      `
    ).all();
  } else {
    result = await env.DB.prepare(
      `
      SELECT ${columns}
      FROM orders
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT 100
      `
    )
      .bind(status)
      .all();
  }

  const orders =
    result.results || [];

  /*
   * แปลงค่าจาก D1
   * ให้อยู่ในรูปแบบที่หน้าแอดมินใช้ง่าย
   */
  for (const order of orders) {
    order.price =
      Number(order.price || 0);

    order.replay_days =
      Number(
        order.replay_days || 0
      );

    order.replay_months =
      Number(
        order.replay_months || 0
      );

    order.has_ecard =
      Number(order.has_ecard) === 1
        ? 1
        : 0;

    order.video_quality =
      order.video_quality ||
      "1080p";
  }

  return jsonResponse(
    {
      success: true,
      orders,
    },
    200,
    corsHeaders
  );
}

/*
 * =========================================
 * GET PAYMENT SLIP
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

  const order =
    await env.DB.prepare(
      `
      SELECT slip_key
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

  if (!order.slip_key) {
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
    new Headers(corsHeaders);

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
 * APPROVE / REJECT ORDER
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
    await readJson(request);

  const newStatus =
    cleanText(body.status);

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

  /*
   * อ่านสิทธิ์จาก orders
   *
   * ไม่อ่านจาก packages โดยตรง
   * เพราะ orders คือ snapshot
   * ของสิทธิ์ตอนลูกค้าซื้อ
   */
  const order =
    await env.DB.prepare(
      `
      SELECT
        id,
        status,
        concert_id,
        package_id,
        package_name,
        access_type,
        replay_days,
        replay_months,
        has_ecard,
        video_quality,
        access_code,
        approved_at,
        access_expires_at
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

  /*
   * =========================================
   * REJECT PAYMENT
   * =========================================
   */

  if (newStatus === "rejected") {
    await env.DB.prepare(
      `
      UPDATE orders
      SET
        status = 'rejected',
        access_code = NULL,
        approved_at = NULL,
        access_expires_at = NULL
      WHERE id = ?
      `
    )
      .bind(orderId)
      .run();

    return jsonResponse(
      {
        success: true,
        orderId,
        status: "rejected",
        message:
          "ปฏิเสธการชำระเงินสำเร็จ",
      },
      200,
      corsHeaders
    );
  }

  /*
   * =========================================
   * APPROVE PAYMENT
   * =========================================
   */

  const approvedAt =
    order.approved_at ||
    new Date().toISOString();

  /*
   * ถ้าเคยอนุมัติแล้ว
   * ใช้ access code เดิม
   *
   * ป้องกันกดอนุมัติซ้ำแล้ว
   * รหัสลูกค้าเปลี่ยน
   */
  const accessCode =
    order.access_code ||
    createAccessCode();

  const accessExpiresAt =
    await calculateAccessExpiry(
      order,
      env
    );

  await env.DB.prepare(
    `
    UPDATE orders
    SET
      status = 'approved',
      access_code = ?,
      approved_at = ?,
      access_expires_at = ?
    WHERE id = ?
    `
  )
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

      package: {
        name:
          order.package_name ||
          "",

        accessType:
          order.access_type ||
          "live",

        replayMonths:
          Number(
            order.replay_months ||
            0
          ),

        hasEcard:
          Number(
            order.has_ecard
          ) === 1,

        videoQuality:
          order.video_quality ||
          "1080p",
      },

      message:
        "อนุมัติการชำระเงินสำเร็จ",
    },
    200,
    corsHeaders
  );
}

/*
 * =========================================
 * DATABASE HELPERS
 * =========================================
 */

async function replacePackageSessions(
  packageId,
  sessionIds,
  env
) {
  /*
   * ลบความสัมพันธ์เดิมก่อน
   */
  await env.DB.prepare(
    `
    DELETE FROM package_sessions
    WHERE package_id = ?
    `
  )
    .bind(packageId)
    .run();

  const now =
    new Date().toISOString();

  /*
   * เพิ่มวันแสดงที่เลือกใหม่
   */
  for (
    const sessionId
    of sessionIds
  ) {
    await env.DB.prepare(
      `
      INSERT OR IGNORE
      INTO package_sessions (
        package_id,
        session_id,
        created_at
      )
      VALUES (?, ?, ?)
      `
    )
      .bind(
        packageId,
        sessionId,
        now
      )
      .run();
  }
}

/*
 * =========================================
 * VALIDATE PACKAGE SESSIONS
 * =========================================
 */

async function validateSessionsForConcert(
  concertId,
  sessionIds,
  env
) {
  if (
    sessionIds.length === 0
  ) {
    return true;
  }

  const placeholders =
    sessionIds
      .map(() => "?")
      .join(",");

  const result =
    await env.DB.prepare(
      `
      SELECT
        COUNT(*) AS total
      FROM concert_sessions
      WHERE concert_id = ?
        AND id IN (${placeholders})
      `
    )
      .bind(
        concertId,
        ...sessionIds
      )
      .first();

  return (
    Number(
      result?.total || 0
    ) ===
    sessionIds.length
  );
}

/*
 * =========================================
 * UPDATE CONCERT DATE RANGE
 * =========================================
 */

async function updateConcertTimeRange(
  concertId,
  env
) {
  const range =
    await env.DB.prepare(
      `
      SELECT
        MIN(live_starts_at)
          AS first_start,

        MAX(live_ends_at)
          AS last_end

      FROM concert_sessions

      WHERE concert_id = ?
        AND is_active = 1
      `
    )
      .bind(concertId)
      .first();

  if (
    !range?.first_start ||
    !range?.last_end
  ) {
    return;
  }

  await env.DB.prepare(
    `
    UPDATE concerts
    SET
      live_starts_at = ?,
      live_ends_at = ?,
      updated_at = ?
    WHERE id = ?
    `
  )
    .bind(
      range.first_start,
      range.last_end,
      new Date().toISOString(),
      concertId
    )
    .run();
}

/*
 * =========================================
 * CALCULATE ACCESS EXPIRY
 * =========================================
 *
 * LIVE:
 * หมดสิทธิ์หลังวันแสดงสุดท้าย
 *
 * LIVE + REPLAY:
 * วันแสดงสุดท้าย
 * + จำนวนเดือน Replay
 *
 * เช่น:
 * คอนเสิร์ตจบ 16 ส.ค.
 * Replay 6 เดือน
 * สิทธิ์หมดประมาณ 16 ก.พ.
 * โดยใช้การบวกเดือนปฏิทิน
 * =========================================
 */

async function calculateAccessExpiry(
  order,
  env
) {
  let finalSessionEnd = null;

  /*
   * หาเวลาจบของวันแสดงสุดท้าย
   * ที่แพ็กเกจนี้มีสิทธิ์ดู
   */
  if (order.package_id) {
    const result =
      await env.DB.prepare(
        `
        SELECT
          MAX(s.live_ends_at)
            AS final_end

        FROM package_sessions ps

        INNER JOIN concert_sessions s
          ON s.id = ps.session_id

        WHERE ps.package_id = ?
          AND s.is_active = 1
        `
      )
        .bind(
          order.package_id
        )
        .first();

    finalSessionEnd =
      result?.final_end ||
      null;
  }

  /*
   * ถ้าเป็น order เก่า
   * หรือไม่มี package session
   *
   * ใช้วันจบรวมของ concert
   */
  if (
    !finalSessionEnd &&
    order.concert_id
  ) {
    const concert =
      await env.DB.prepare(
        `
        SELECT
          live_ends_at
        FROM concerts
        WHERE id = ?
        LIMIT 1
        `
      )
        .bind(
          order.concert_id
        )
        .first();

    finalSessionEnd =
      concert?.live_ends_at ||
      null;
  }

  /*
   * Legacy order บางรายการ
   * อาจไม่มี concert_id
   */
  if (!finalSessionEnd) {
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
   * =========================================
   * LIVE + REPLAY
   * =========================================
   */

  if (
    order.access_type ===
    "live_replay"
  ) {
    const replayMonths =
      Number(
        order.replay_months ||
        0
      );

    /*
     * ระบบใหม่:
     * ใช้จำนวนเดือนก่อน
     */
    if (replayMonths > 0) {
      addUtcCalendarMonths(
        expiry,
        replayMonths
      );
    } else {
      /*
       * ระบบเก่า:
       * ถ้ายังไม่มี replay_months
       * ใช้ replay_days
       */
      const replayDays =
        Number(
          order.replay_days ||
          0
        );

      if (replayDays > 0) {
        expiry.setUTCDate(
          expiry.getUTCDate() +
          replayDays
        );
      }
    }
  }

  return expiry.toISOString();
}

/*
 * =========================================
 * ADD CALENDAR MONTHS
 * =========================================
 *
 * ใช้เดือนจริง ไม่ใช้ 30 วันต่อเดือน
 *
 * ตัวอย่าง:
 * 15 ส.ค. + 6 เดือน
 * = 15 ก.พ.
 *
 * ถ้าวันปลายทางไม่มี เช่น
 * 31 ส.ค. + 6 เดือน
 * จะใช้วันสุดท้ายของเดือนปลายทาง
 * =========================================
 */

function addUtcCalendarMonths(
  date,
  months
) {
  const originalDay =
    date.getUTCDate();

  /*
   * ตั้งเป็นวันที่ 1 ก่อน
   * เพื่อป้องกัน JavaScript
   * กระโดดข้ามเดือน
   */
  date.setUTCDate(1);

  date.setUTCMonth(
    date.getUTCMonth() +
    months
  );

  /*
   * หาวันสุดท้าย
   * ของเดือนปลายทาง
   */
  const lastDay =
    new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
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
 * VALIDATION AND UTILITIES
 * =========================================
 */

function validatePackageInput(
  concertId,
  name,
  price,
  accessType,
  replayMonths,
  videoQuality
) {
  if (!concertId) {
    return "ไม่พบรหัสคอนเสิร์ต";
  }

  if (!name) {
    return "กรุณากรอกชื่อแพ็กเกจ";
  }

  if (price === null) {
    return "ราคาแพ็กเกจไม่ถูกต้อง";
  }

  if (!accessType) {
    return "ประเภทสิทธิ์ไม่ถูกต้อง";
  }

  if (replayMonths === null) {
    return "จำนวนเดือน Replay ไม่ถูกต้อง";
  }

  if (!videoQuality) {
    return "ความคมชัดไม่ถูกต้อง";
  }

  return "";
}

function validateSlip(slip) {
  if (
    !(slip instanceof File) ||
    slip.size === 0
  ) {
    return "กรุณาแนบภาพสลิป";
  }

  if (
    !slip.type.startsWith(
      "image/"
    )
  ) {
    return "รองรับเฉพาะไฟล์รูปภาพ";
  }

  const maximumSize =
    5 * 1024 * 1024;

  if (
    slip.size >
    maximumSize
  ) {
    return "ไฟล์สลิปต้องมีขนาดไม่เกิน 5 MB";
  }

  return "";
}

async function readJson(
  request
) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getPathId(
  path,
  prefix
) {
  return decodeURIComponent(
    path.replace(
      prefix,
      ""
    )
  ).trim();
}

function cleanText(value) {
  return String(
    value || ""
  ).trim();
}

function cleanOptionalText(
  value
) {
  const text =
    String(
      value || ""
    ).trim();

  return text || null;
}

function normalizeDate(
  value
) {
  const text =
    String(
      value || ""
    ).trim();

  if (!text) {
    return "";
  }

  const date =
    new Date(text);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toISOString();
}

function normalizeConcertStatus(
  value
) {
  const status =
    String(
      value || "draft"
    ).trim();

  const allowed = [
    "draft",
    "on_sale",
    "live",
    "ended",
    "hidden",
  ];

  return allowed.includes(
    status
  )
    ? status
    : "";
}

function normalizePrice(
  value
) {
  const price =
    Number(value);

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

function normalizeAccessType(
  value
) {
  const accessType =
    String(
      value || "live"
    ).trim();

  const allowed = [
    "live",
    "live_replay",
  ];

  return allowed.includes(
    accessType
  )
    ? accessType
    : "";
}

/*
 * ระบบใหม่:
 * Replay เป็นจำนวนเดือน
 */

function normalizeReplayMonths(
  value,
  accessType
) {
  if (
    accessType === "live"
  ) {
    return 0;
  }

  const months =
    Number(value);

  if (
    !Number.isInteger(
      months
    ) ||
    months < 1 ||
    months > 120
  ) {
    return null;
  }

  return months;
}

/*
 * ระบบเดิม:
 * เก็บ replay_days ไว้
 * เพื่อให้ข้อมูลเก่าไม่เสีย
 */

function normalizeLegacyReplayDays(
  value,
  accessType
) {
  if (
    accessType === "live"
  ) {
    return 0;
  }

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  const days =
    Number(value);

  if (
    !Number.isInteger(
      days
    ) ||
    days < 0 ||
    days > 3650
  ) {
    return 0;
  }

  return days;
}

function normalizeVideoQuality(
  value
) {
  const quality =
    String(
      value || "1080p"
    ).trim();

  const allowed = [
    "720p",
    "1080p",
    "4k",
  ];

  const normalized =
    quality.toLowerCase();

  if (
    !allowed.includes(
      normalized
    )
  ) {
    return "";
  }

  if (
    normalized === "4k"
  ) {
    return "4K";
  }

  return normalized;
}

function normalizeNonNegativeInteger(
  value,
  defaultValue
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number =
    Number(value);

  if (
    !Number.isInteger(
      number
    ) ||
    number < 0
  ) {
    return defaultValue;
  }

  return number;
}

function normalizeBooleanNumber(
  value,
  defaultValue
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "on"
  ) {
    return 1;
  }

  return 0;
}

function normalizeIdArray(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return [
    ...new Set(
      value
        .map(
          item =>
            String(
              item || ""
            ).trim()
        )
        .filter(Boolean)
    ),
  ];
}

function createId(prefix) {
  const timePart =
    Date.now()
      .toString(36)
      .toUpperCase();

  const randomPart =
    crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 8)
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
  const randomPart =
    crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 10)
      .toUpperCase();

  return (
    "LIVE-" +
    randomPart
  );
}

function isAdmin(
  request,
  env
) {
  if (!env.ADMIN_TOKEN) {
    return false;
  }

  const authorization =
    request.headers.get(
      "Authorization"
    ) || "";

  const bearerToken =
    authorization.startsWith(
      "Bearer "
    )
      ? authorization
          .slice(7)
          .trim()
      : "";

  const headerToken =
    request.headers.get(
      "X-Admin-Token"
    ) || "";

  const suppliedToken =
    bearerToken ||
    headerToken;

  return (
    suppliedToken ===
    env.ADMIN_TOKEN
  );
}

function jsonResponse(
  data,
  status,
  corsHeaders
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders,

        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control":
          "no-store",
      },
    }
  );
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

    "image/heic":
      "heic",

    "image/heif":
      "heif",
  };

  return (
    extensions[
      contentType
    ] ||
    "jpg"
  );
}
