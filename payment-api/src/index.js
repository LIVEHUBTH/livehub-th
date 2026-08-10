export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods":
        "GET, POST, DELETE, OPTIONS",
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
 * LINE MESSAGING API WEBHOOK
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
       * VIEWING SESSION API
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

      if (
        path.startsWith(
          "/api/admin/orders/"
        ) &&
        path.endsWith("/status") &&
        request.method === "POST"
      ) {
        const orderId =
          getOrderIdFromStatusPath(
            path
          );

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
  env,
  corsHeaders
) {
  const concertsResult =
    await env.DB.prepare(
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
    const sessionsResult =
      await env.DB.prepare(
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
        ORDER BY
          sort_order ASC,
          live_starts_at ASC
        `
      )
        .bind(concert.id)
        .all();

    const packagesResult =
      await env.DB.prepare(
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
        ORDER BY
          price ASC,
          created_at ASC
        `
      )
        .bind(concert.id)
        .all();

    concert.sessions =
      sessionsResult.results || [];

    concert.packages =
      packagesResult.results || [];

    for (
      const packageItem
      of concert.packages
    ) {
      const linkedResult =
        await env.DB.prepare(
          `
          SELECT session_id
          FROM package_sessions
          WHERE package_id = ?
          ORDER BY created_at ASC
          `
        )
          .bind(packageItem.id)
          .all();

      packageItem.session_ids =
        (
          linkedResult.results || []
        ).map(
          item => item.session_id
        );

      packageItem.price =
        Number(
          packageItem.price || 0
        );

      packageItem.replay_days =
        Number(
          packageItem.replay_days || 0
        );

      packageItem.replay_months =
        Number(
          packageItem.replay_months || 0
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
 * ADMIN CONCERTS
 * =========================================
 */

async function getAdminConcerts(
  env,
  corsHeaders
) {
  const result =
    await env.DB.prepare(
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

  const concerts =
    result.results || [];

  for (const concert of concerts) {
    concert.session_count =
      Number(
        concert.session_count || 0
      );

    concert.package_count =
      Number(
        concert.package_count || 0
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
  const body =
    await readJson(request);

  const input =
    normalizeConcertInput(body);

  const validationError =
    validateConcertInput(input);

  if (validationError) {
    return errorResponse(
      validationError,
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

  const input =
    normalizeConcertInput(body);

  const validationError =
    validateConcertInput(input);

  if (validationError) {
    return errorResponse(
      validationError,
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
      input.title,
      input.description,
      input.coverImageUrl,
      input.liveStartsAt,
      input.liveEndsAt,
      input.status,
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

function normalizeConcertInput(
  body
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
        body.coverImageUrl
      ),

    liveStartsAt:
      normalizeDate(
        body.liveStartsAt
      ),

    liveEndsAt:
      normalizeDate(
        body.liveEndsAt
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
  if (!input.title) {
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

  if (!input.status) {
    return "สถานะคอนเสิร์ตไม่ถูกต้อง";
  }

  return "";
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
      ORDER BY
        sort_order ASC,
        live_starts_at ASC
      `
    )
      .bind(concertId)
      .all();

  const sessions =
    result.results || [];

  for (const session of sessions) {
    session.sort_order =
      Number(
        session.sort_order || 0
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
  const body =
    await readJson(request);

  const input =
    normalizeSessionInput(body);

  const validationError =
    validateSessionInput(input);

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
      .bind(input.concertId)
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
    await env.DB.prepare(
      `
      SELECT
        id,
        concert_id
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

  const input =
    normalizeSessionInput({
      ...body,
      concertId:
        existing.concert_id,
    });

  const validationError =
    validateSessionInput(input);

  if (validationError) {
    return errorResponse(
      validationError,
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
      input.name,
      input.liveStartsAt,
      input.liveEndsAt,
      input.sortOrder,
      input.isActive,
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

function normalizeSessionInput(
  body
) {
  return {
    concertId:
      cleanText(
        body.concertId
      ),

    name:
      cleanText(
        body.name
      ),

    liveStartsAt:
      normalizeDate(
        body.liveStartsAt
      ),

    liveEndsAt:
      normalizeDate(
        body.liveEndsAt
      ),

    sortOrder:
      normalizeNonNegativeInteger(
        body.sortOrder,
        0
      ),

    isActive:
      normalizeBooleanNumber(
        body.isActive,
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
      )
    );

  let result;

  if (concertId) {
    result =
      await env.DB.prepare(
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
    result =
      await env.DB.prepare(
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

  const packages =
    result.results || [];

  for (
    const packageItem
    of packages
  ) {
    const linkedResult =
      await env.DB.prepare(
        `
        SELECT session_id
        FROM package_sessions
        WHERE package_id = ?
        ORDER BY created_at ASC
        `
      )
        .bind(packageItem.id)
        .all();

    packageItem.session_ids =
      (
        linkedResult.results || []
      ).map(
        item => item.session_id
      );

    packageItem.price =
      Number(
        packageItem.price || 0
      );

    packageItem.replay_days =
      Number(
        packageItem.replay_days || 0
      );

    packageItem.replay_months =
      Number(
        packageItem.replay_months || 0
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
  const body =
    await readJson(request);

  const input =
    normalizePackageInput(body);

  const validationError =
    validatePackageInput(
      input.concertId,
      input.name,
      input.price,
      input.accessType,
      input.replayDays,
      input.replayMonths,
      input.videoQuality
    );

  if (validationError) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  if (
    input.sessionIds.length === 0
  ) {
    return errorResponse(
      "กรุณาเลือกวันแสดงอย่างน้อย 1 วัน",
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
      .bind(input.concertId)
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

  if (!sessionsValid) {
    return errorResponse(
      "มีวันแสดงที่ไม่ได้อยู่ในคอนเสิร์ตนี้",
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
      input.concertId,
      input.name,
      input.price,
      input.accessType,
      input.replayDays,
      input.replayMonths,
      input.hasEcard,
      input.videoQuality,
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
    await env.DB.prepare(
      `
      DELETE FROM packages
      WHERE id = ?
      `
    )
      .bind(packageId)
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
    await env.DB.prepare(
      `
      SELECT
        id,
        concert_id,
        access_type,
        replay_days,
        replay_months
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

  const input =
    normalizePackageInput({
      ...body,

      concertId:
        existing.concert_id,
    });

  if (
    input.accessType === "live"
  ) {
    input.replayDays = 0;
    input.replayMonths = 0;
  }

  const validationError =
    validatePackageInput(
      existing.concert_id,
      input.name,
      input.price,
      input.accessType,
      input.replayDays,
      input.replayMonths,
      input.videoQuality
    );

  if (validationError) {
    return errorResponse(
      validationError,
      400,
      corsHeaders
    );
  }

  if (
    input.sessionIds.length === 0
  ) {
    return errorResponse(
      "กรุณาเลือกวันแสดงอย่างน้อย 1 วัน",
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

  if (!sessionsValid) {
    return errorResponse(
      "มีวันแสดงที่ไม่ได้อยู่ในคอนเสิร์ตนี้",
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
      input.name,
      input.price,
      input.accessType,
      input.replayDays,
      input.replayMonths,
      input.hasEcard,
      input.videoQuality,
      input.isActive,
      new Date().toISOString(),
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

function normalizePackageInput(
  body
) {
  const accessType =
    normalizeAccessType(
      body.accessType
    );

  return {
    concertId:
      cleanText(
        body.concertId
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
        body.replayDays,
        accessType
      ),

    replayMonths:
      normalizeReplayMonths(
        body.replayMonths,
        accessType
      ),

    hasEcard:
      normalizeBooleanNumber(
        body.hasEcard,
        0
      ),

    videoQuality:
      normalizeVideoQuality(
        body.videoQuality
      ),

    isActive:
      normalizeBooleanNumber(
        body.isActive,
        1
      ),

    sessionIds:
      normalizeIdArray(
        body.sessionIds
      ),
  };
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
      SELECT
        COUNT(*) AS total
      FROM orders
      WHERE package_id = ?
      `
    )
      .bind(packageId)
      .first();

  if (
    Number(
      orderCount?.total || 0
    ) > 0
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
        " สำเร็จ",
    },
    200,
    corsHeaders
  );
}
/*
 * =========================================
 * PAYMENT + EASYSLIP AUTO APPROVAL
 * =========================================
 */

async function createPayment(
  request,
  env,
  corsHeaders
) {
  if (!env.EASYSLIP_API_KEY) {
    return errorResponse(
      "ระบบตรวจสลิปยังไม่ได้ตั้งค่า EASYSLIP_API_KEY",
      500,
      corsHeaders
    );
  }

  const formData =
    await request.formData();

  const packageId =
    cleanText(
      formData.get(
        "packageId"
      )
    );

  const sessionId =
    cleanText(
      formData.get(
        "sessionId"
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

  if (!packageId) {
    return errorResponse(
      "กรุณาเลือกแพ็กเกจ",
      400,
      corsHeaders
    );
  }

  if (!sessionId) {
    return errorResponse(
      "กรุณาเลือกวันแสดง",
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
    validateSlip(slip);

  if (slipError) {
    return errorResponse(
      slipError,
      400,
      corsHeaders
    );
  }

  const selectedPackage =
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

  if (!selectedPackage) {
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

  const selectedSession =
    await env.DB.prepare(
      `
      SELECT
        s.id,
        s.concert_id,
        s.name,
        s.live_starts_at,
        s.live_ends_at
      FROM package_sessions ps
      INNER JOIN concert_sessions s
        ON s.id = ps.session_id
      WHERE ps.package_id = ?
        AND s.id = ?
        AND s.concert_id = ?
        AND s.is_active = 1
      LIMIT 1
      `
    )
      .bind(
        packageId,
        sessionId,
        selectedPackage.concert_id
      )
      .first();

  if (!selectedSession) {
    return errorResponse(
      "วันแสดงที่เลือกไม่อยู่ในสิทธิ์ของแพ็กเกจนี้",
      400,
      corsHeaders
    );
  }

  const orderId =
    createId("LH");

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

  if (easySlip.isDuplicate) {
    return errorResponse(
      "สลิปนี้เคยถูกใช้แล้ว กรุณาใช้สลิปใหม่",
      409,
      corsHeaders
    );
  }

  if (!easySlip.isAmountMatched) {
    return errorResponse(
      "ยอดเงินในสลิป " +
      easySlip.amountInSlip
        .toLocaleString(
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

  if (!easySlip.transRef) {
    return errorResponse(
      "ไม่พบเลขอ้างอิงธุรกรรมในสลิป",
      400,
      corsHeaders
    );
  }

  const usedSlip =
    await env.DB.prepare(
      `
      SELECT id
      FROM orders
      WHERE easyslip_trans_ref = ?
      LIMIT 1
      `
    )
      .bind(
        easySlip.transRef
      )
      .first();

  if (usedSlip) {
    return errorResponse(
      "สลิปนี้เคยถูกใช้สร้างคำสั่งซื้อแล้ว",
      409,
      corsHeaders
    );
  }

  const extension =
    getImageExtension(
      slip.type
    );

  const slipKey =
    `slips/${orderId}.${extension}`;

  const now =
    new Date().toISOString();

  const orderSnapshot = {
    concert_id:
      selectedPackage.concert_id,

    package_id:
      selectedPackage.id,

    package_name:
      selectedPackage.name,

    access_type:
      selectedPackage.access_type,

    replay_days:
      Number(
        selectedPackage.replay_days ||
        0
      ),

    replay_months:
      Number(
        selectedPackage.replay_months ||
        0
      ),

    has_ecard:
      Number(
        selectedPackage.has_ecard ||
        0
      ),

    video_quality:
      selectedPackage.video_quality ||
      "1080p",

    selected_session_id:
      selectedSession.id,

    selected_session_name:
      selectedSession.name,

    selected_session_starts_at:
      selectedSession.live_starts_at,

    selected_session_ends_at:
      selectedSession.live_ends_at,
  };

  const accessExpiresAt =
    await calculateAccessExpiry(
      orderSnapshot,
      env
    );

  if (!accessExpiresAt) {
    return errorResponse(
      "ไม่สามารถคำนวณวันหมดอายุสิทธิ์ได้",
      400,
      corsHeaders
    );
  }

  const accessCode =
    createAccessCode();

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

        sessionId:
          selectedSession.id,

        price:
          String(
            selectedPackage.price
          ),

        transRef:
          easySlip.transRef,
      },
    }
  );

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
      `
    )
      .bind(
        orderId,
        packageId,
        Number(
          selectedPackage.price
        ),
        slipKey,
        now,
        orderSnapshot.concert_id,
        orderSnapshot.package_id,
        orderSnapshot.package_name,
        orderSnapshot.access_type,
        orderSnapshot.replay_days,
        orderSnapshot.replay_months,
        orderSnapshot.has_ecard,
        orderSnapshot.video_quality,
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

  } catch (databaseError) {
    await env.SLIPS.delete(
      slipKey
    );

    const errorText =
      String(
        databaseError?.message || ""
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

      selectedSession: {
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
      },

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

        replayDays:
          Number(
            selectedPackage
              .replay_days || 0
          ),

        replayMonths:
          Number(
            selectedPackage
              .replay_months || 0
          ),

        hasEcard:
          Number(
            selectedPackage
              .has_ecard || 0
          ) === 1,

        videoQuality:
          selectedPackage
            .video_quality ||
          "1080p",
      },

      verification: {
        amount:
          easySlip.amountInSlip,

        transRef:
          easySlip.transRef,

        senderName:
          easySlip.senderName,

        receiverName:
          easySlip.receiverName,
      },

      message:
        "ตรวจสอบสลิปและอนุมัติอัตโนมัติสำเร็จ กรุณาเก็บรหัสเข้าชมไว้",
    },
    201,
    corsHeaders
  );
}

/*
 * =========================================
 * EASYSLIP VERIFICATION
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
    slip.name || "slip.jpg"
  );

  easySlipForm.append(
    "remark",
    orderId
  );

  easySlipForm.append(
    "matchAccount",
    "false"
  );

  easySlipForm.append(
    "matchAmount",
    String(expectedAmount)
  );

  easySlipForm.append(
    "checkDuplicate",
    "false"
  );

  let response;

  try {
    response =
      await fetch(
        "https://api.easyslip.com/v2/verify/bank",
        {
          method: "POST",

          headers: {
            Authorization:
              "Bearer " +
              env.EASYSLIP_API_KEY,
          },

          body:
            easySlipForm,
        }
      );
  } catch (error) {
    const networkError =
      new Error(
        "ไม่สามารถเชื่อมต่อ EasySlip ได้ กรุณาลองใหม่อีกครั้ง"
      );

    networkError.status = 502;

    throw networkError;
  }

  let result;

  try {
    result =
      await response.json();
  } catch {
    const invalidResponseError =
      new Error(
        "EasySlip ส่งข้อมูลตอบกลับไม่ถูกต้อง"
      );

    invalidResponseError.status = 502;

    throw invalidResponseError;
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
    };

    const message =
      messages[code] ||
      apiMessage ||
      "ตรวจสอบสลิปไม่สำเร็จ";

    const easySlipError =
      new Error(message);

    easySlipError.code =
      code;

    easySlipError.status =
      response.status;

    throw easySlipError;
  }

  const data =
    result.data || {};

  const rawSlip =
    data.rawSlip || {};

  const amountInSlip =
    Number(
      data.amountInSlip ??
      rawSlip?.amount?.amount ??
      0
    );

  const isAmountMatched =
    typeof data.isAmountMatched ===
    "boolean"
      ? data.isAmountMatched
      : (
          Number.isFinite(
            amountInSlip
          ) &&
          Math.abs(
            amountInSlip -
            Number(expectedAmount)
          ) < 0.001
        );

  const matchedAccount =
    normalizeMatchedAccount(
      data.matchedAccount
    );

  return {
    isDuplicate:
      Boolean(
        data.isDuplicate
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

function normalizeMatchedAccount(
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
    typeof value === "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    if (
      normalized === "true" ||
      normalized === "matched" ||
      normalized === "success"
    ) {
      return true;
    }
  }

  return false;
}

function normalizeEasySlipHttpStatus(
  error
) {
  const status =
    Number(
      error?.status || 0
    );

  if (
    status === 400 ||
    status === 404 ||
    status === 409 ||
    status === 422
  ) {
    return status;
  }

  if (
    status === 401 ||
    status === 403
  ) {
    return 502;
  }

  if (status === 429) {
    return 503;
  }

  if (
    status >= 500
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

/*
 * =========================================
 * SLIP VALIDATION
 * =========================================
 */

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

  const maximumSize =
    4 * 1024 * 1024;

  if (
    slip.size >
    maximumSize
  ) {
    return "ไฟล์สลิปต้องมีขนาดไม่เกิน 4 MB";
  }

  return "";
}

/*
 * =========================================
 * PUBLIC ACCESS CODE VERIFICATION
 * =========================================
 */

async function verifyAccessCode(
  request,
  env,
  corsHeaders
) {
  const body =
    await readJson(request);

  const accessCode =
    cleanText(
      body.accessCode
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

  if (!result.ok) {
    return errorResponse(
      result.message,
      result.status,
      corsHeaders
    );
  }

  return buildAccessVerificationResponse(
    result.order,
    result.concert,
    corsHeaders
  );
}

/*
 * =========================================
 * VIEWING SESSION
 * 1 ORDER = 1 ACTIVE DEVICE
 * =========================================
 */

async function startViewingSession(
  request,
  env,
  corsHeaders
) {
  const body =
    await readJson(request);

  const accessCode =
    cleanText(
      body.accessCode
    ).toUpperCase();

  const deviceId =
    cleanText(
      body.deviceId
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
    deviceId.length > 200
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

  if (!result.ok) {
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

  /*
   * session เก่าที่ไม่มี heartbeat
   * เกิน 2 นาที ถือว่าหลุดแล้ว
   */
  const staleBefore =
    new Date(
      now.getTime() -
      2 * 60 * 1000
    ).toISOString();

  await env.DB.prepare(
    `
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
      AND is_active = 1
      AND last_seen_at < ?
    `
  )
    .bind(
      order.id,
      staleBefore
    )
    .run();

  /*
   * ถ้าเครื่องเดิมมี session อยู่แล้ว
   * ให้ยกเลิก session เดิมก่อนสร้างใหม่
   */
  await env.DB.prepare(
    `
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE order_id = ?
      AND device_id = ?
      AND is_active = 1
    `
  )
    .bind(
      order.id,
      deviceId
    )
    .run();

  /*
   * ถ้ามีเครื่องอื่นกำลังใช้อยู่
   * ไม่อนุญาตให้เปิดพร้อมกัน
   */
  const activeOtherDevice =
    await env.DB.prepare(
      `
      SELECT
        id,
        device_id,
        last_seen_at
      FROM viewing_sessions
      WHERE order_id = ?
        AND is_active = 1
        AND device_id <> ?
      ORDER BY last_seen_at DESC
      LIMIT 1
      `
    )
      .bind(
        order.id,
        deviceId
      )
      .first();

  if (activeOtherDevice) {
    return errorResponse(
      "สิทธิ์นี้กำลังถูกใช้งานอยู่บนอุปกรณ์อื่น กรุณาปิดการรับชมจากอุปกรณ์เดิมก่อน",
      409,
      corsHeaders
    );
  }

  const viewingSessionId =
    createId("VS");

  const sessionToken =
    createViewingSessionToken();

  const sessionExpiresAt =
    order.access_expires_at;

  await env.DB.prepare(
    `
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `
  )
    .bind(
      viewingSessionId,
      order.id,
      order.access_code,
      deviceId,
      sessionToken,
      nowIso,
      nowIso,
      sessionExpiresAt
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

      concert: {
        id:
          result.concert?.id ||
          "",

        title:
          result.concert?.title ||
          "",

        description:
          result.concert
            ?.description ||
          "",

        coverImageUrl:
          result.concert
            ?.cover_image_url ||
          "",

        liveStartsAt:
          result.concert
            ?.live_starts_at ||
          null,

        liveEndsAt:
          result.concert
            ?.live_ends_at ||
          null,

        status:
          result.concert?.status ||
          "",
      },

      session: {
        id:
          order.selected_session_id ||
          "",

        name:
          order.selected_session_name ||
          "",

        liveStartsAt:
          order
            .selected_session_starts_at ||
          null,

        liveEndsAt:
          order
            .selected_session_ends_at ||
          null,
      },

      package: {
        id:
          order.package_id ||
          "",

        name:
          order.package_name ||
          "",

        accessType:
          order.access_type ||
          "live",

        replayDays:
          Number(
            order.replay_days ||
            0
          ),

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
    await readJson(request);

  const sessionToken =
    cleanText(
      body.sessionToken
    );

  const deviceId =
    cleanText(
      body.deviceId
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
    await env.DB.prepare(
      `
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
      `
    )
      .bind(
        sessionToken
      )
      .first();

  if (!viewingSession) {
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
    await env.DB.prepare(
      `
      UPDATE viewing_sessions
      SET is_active = 0
      WHERE id = ?
      `
    )
      .bind(
        viewingSession.id
      )
      .run();

    return errorResponse(
      "สิทธิ์การรับชมหมดอายุแล้ว",
      403,
      corsHeaders
    );
  }

  const order =
    await env.DB.prepare(
      `
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
      `
    )
      .bind(
        viewingSession.order_id
      )
      .first();

  if (
    !order ||
    order.status !== "approved"
  ) {
    await env.DB.prepare(
      `
      UPDATE viewing_sessions
      SET is_active = 0
      WHERE id = ?
      `
    )
      .bind(
        viewingSession.id
      )
      .run();

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
    await env.DB.prepare(
      `
      UPDATE viewing_sessions
      SET is_active = 0
      WHERE id = ?
      `
    )
      .bind(
        viewingSession.id
      )
      .run();

    return errorResponse(
      "สิทธิ์การรับชมหมดอายุแล้ว",
      403,
      corsHeaders
    );
  }

  const now =
    new Date().toISOString();

  await env.DB.prepare(
    `
    UPDATE viewing_sessions
    SET last_seen_at = ?
    WHERE id = ?
      AND is_active = 1
    `
  )
    .bind(
      now,
      viewingSession.id
    )
    .run();

  return jsonResponse(
    {
      success: true,
      valid: true,
      sessionToken:
        viewingSession.session_token,
      accessCode:
        order.access_code,
      accessExpiresAt:
        order.access_expires_at,
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
    await readJson(request);

  const sessionToken =
    cleanText(
      body.sessionToken
    );

  const deviceId =
    cleanText(
      body.deviceId
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

  await env.DB.prepare(
    `
    UPDATE viewing_sessions
    SET is_active = 0
    WHERE session_token = ?
      AND device_id = ?
    `
  )
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

async function getApprovedOrderByAccessCode(
  accessCode,
  env
) {
  const order =
    await env.DB.prepare(
      `
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
      WHERE access_code = ?
      LIMIT 1
      `
    )
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
    order.status !== "approved"
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "รหัสนี้ยังไม่ได้รับการอนุมัติ",
    };
  }

  if (
    !order.access_expires_at
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "รหัสนี้ยังไม่มีข้อมูลวันหมดอายุ",
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
    await env.DB.prepare(
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
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(
        order.concert_id
      )
      .first();

  return {
    ok: true,
    order,
    concert,
  };
}

function buildAccessVerificationResponse(
  order,
  concert,
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

      accessExpiresAt:
        order.access_expires_at,

      concert: {
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
          concert?.cover_image_url ||
          "",

        liveStartsAt:
          concert?.live_starts_at ||
          null,

        liveEndsAt:
          concert?.live_ends_at ||
          null,

        status:
          concert?.status ||
          "",
      },

      session: {
        id:
          order.selected_session_id ||
          "",

        name:
          order.selected_session_name ||
          "",

        liveStartsAt:
          order
            .selected_session_starts_at ||
          null,

        liveEndsAt:
          order
            .selected_session_ends_at ||
          null,
      },

      package: {
        id:
          order.package_id ||
          "",

        name:
          order.package_name ||
          "",

        accessType:
          order.access_type ||
          "live",

        replayDays:
          Number(
            order.replay_days ||
            0
          ),

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
    ) || "pending";

  const allowed = [
    "pending",
    "approved",
    "rejected",
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
    video_quality,

    selected_session_id,
    selected_session_name,
    selected_session_starts_at,
    selected_session_ends_at,

    easyslip_trans_ref,
    easyslip_verified_at,
    easyslip_amount,
    easyslip_receiver_name,
    easyslip_sender_name,
    easyslip_status,
    easyslip_message
  `;

  let result;

  if (
    status === "all"
  ) {
    result =
      await env.DB.prepare(
        `
        SELECT ${columns}
        FROM orders
        ORDER BY created_at DESC
        LIMIT 100
        `
      ).all();

  } else {
    result =
      await env.DB.prepare(
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

  for (
    const order
    of orders
  ) {
    order.price =
      Number(
        order.price || 0
      );

    order.easyslip_amount =
      order.easyslip_amount ===
        null ||
      order.easyslip_amount ===
        undefined
        ? null
        : Number(
            order.easyslip_amount
          );

    order.replay_days =
      Number(
        order.replay_days || 0
      );

    order.replay_months =
      Number(
        order.replay_months || 0
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
 * PAYMENT SLIP
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
    cleanText(
      body.status
    );

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
        access_expires_at,
        selected_session_id,
        selected_session_name,
        selected_session_starts_at,
        selected_session_ends_at
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

  if (
    newStatus === "rejected"
  ) {
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

    await env.DB.prepare(
      `
      UPDATE viewing_sessions
      SET is_active = 0
      WHERE order_id = ?
        AND is_active = 1
      `
    )
      .bind(orderId)
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

  const approvedAt =
    order.approved_at ||
    new Date().toISOString();

  const accessCode =
    order.access_code ||
    createAccessCode();

  const accessExpiresAt =
    order.access_expires_at ||
    await calculateAccessExpiry(
      order,
      env
    );

  if (!accessExpiresAt) {
    return errorResponse(
      "ไม่สามารถคำนวณวันหมดอายุสิทธิ์ได้ กรุณาตรวจสอบวันแสดง",
      400,
      corsHeaders
    );
  }

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

      selectedSession: {
        id:
          order
            .selected_session_id ||
          "",

        name:
          order
            .selected_session_name ||
          "",

        liveStartsAt:
          order
            .selected_session_starts_at ||
          null,

        liveEndsAt:
          order
            .selected_session_ends_at ||
          null,
      },

      package: {
        name:
          order.package_name ||
          "",

        accessType:
          order.access_type ||
          "live",

        replayDays:
          Number(
            order.replay_days ||
            0
          ),

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
 * PACKAGE SESSION HELPERS
 * =========================================
 */

async function replacePackageSessions(
  packageId,
  sessionIds,
  env
) {
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
      .map(
        () => "?"
      )
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
 * UPDATE CONCERT TIME RANGE
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
 * ACCESS EXPIRY
 * =========================================
 */

async function calculateAccessExpiry(
  order,
  env
) {
  let finalSessionEnd =
    order.selected_session_ends_at ||
    null;

  if (
    !finalSessionEnd &&
    order.package_id
  ) {
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

  if (
    !finalSessionEnd &&
    order.concert_id
  ) {
    const concert =
      await env.DB.prepare(
        `
        SELECT live_ends_at
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

  if (
    order.access_type ===
    "live_replay"
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
      replayMonths > 0
    ) {
      addUtcCalendarMonths(
        expiry,
        replayMonths
      );

    } else if (
      replayDays > 0
    ) {
      expiry.setUTCDate(
        expiry.getUTCDate() +
        replayDays
      );
    }
  }

  return expiry.toISOString();
}

/*
 * =========================================
 * ADD UTC CALENDAR MONTHS
 * =========================================
 */

function addUtcCalendarMonths(
  date,
  months
) {
  const originalDay =
    date.getUTCDate();

  date.setUTCDate(1);

  date.setUTCMonth(
    date.getUTCMonth() +
    months
  );

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
 * PACKAGE VALIDATION
 * =========================================
 */

function validatePackageInput(
  concertId,
  name,
  price,
  accessType,
  replayDays,
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

  if (replayDays === null) {
    return "จำนวนวัน Replay ไม่ถูกต้อง";
  }

  if (replayMonths === null) {
    return "จำนวนเดือน Replay ไม่ถูกต้อง";
  }

  if (
    accessType === "live_replay" &&
    Number(replayDays) < 1 &&
    Number(replayMonths) < 1
  ) {
    return "แพ็กเกจ LIVE + REPLAY ต้องมีจำนวนวันหรือจำนวนเดือน Replay";
  }

  if (
    Number(replayDays) > 0 &&
    Number(replayMonths) > 0
  ) {
    return "กรุณากำหนด Replay เป็นจำนวนวันหรือจำนวนเดือนอย่างใดอย่างหนึ่ง";
  }

  if (!videoQuality) {
    return "ความคมชัดไม่ถูกต้อง";
  }

  return "";
}

/*
 * =========================================
 * REQUEST UTILITIES
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

function getPathId(
  path,
  prefix
) {
  const remainder =
    path.startsWith(prefix)
      ? path.slice(
          prefix.length
        )
      : "";

  if (
    !remainder ||
    remainder.includes("/")
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

function getOrderIdFromStatusPath(
  path
) {
  const prefix =
    "/api/admin/orders/";

  const suffix =
    "/status";

  if (
    !path.startsWith(prefix) ||
    !path.endsWith(suffix)
  ) {
    return "";
  }

  const encodedId =
    path.slice(
      prefix.length,
      path.length -
        suffix.length
    );

  if (
    !encodedId ||
    encodedId.includes("/")
  ) {
    return "";
  }

  try {
    return decodeURIComponent(
      encodedId
    ).trim();

  } catch {
    return "";
  }
}

/*
 * =========================================
 * NORMALIZATION
 * =========================================
 */

function cleanText(
  value
) {
  return String(
    value ?? ""
  ).trim();
}

function cleanOptionalText(
  value
) {
  const text =
    String(
      value ?? ""
    ).trim();

  return text || null;
}

function normalizeDate(
  value
) {
  const text =
    String(
      value ?? ""
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
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

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

function normalizeReplayDays(
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
    return null;
  }

  return days;
}

function normalizeReplayMonths(
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

  const months =
    Number(value);

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

function normalizeVideoQuality(
  value
) {
  const quality =
    String(
      value || "1080p"
    )
      .trim()
      .toLowerCase();

  const allowed = [
    "720p",
    "1080p",
    "4k",
  ];

  if (
    !allowed.includes(
      quality
    )
  ) {
    return "";
  }

  if (
    quality === "4k"
  ) {
    return "4K";
  }

  return quality;
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
              item ?? ""
            ).trim()
        )
        .filter(Boolean)
    ),
  ];
}

/*
 * =========================================
 * ID GENERATORS
 * =========================================
 */

function createId(
  prefix
) {
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

function createViewingSessionToken() {
  const part1 =
    crypto
      .randomUUID()
      .replaceAll("-", "");

  const part2 =
    crypto
      .randomUUID()
      .replaceAll("-", "");

  return (
    "VS_" +
    part1 +
    part2
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

/*
 * =========================================
 * RESPONSE HELPERS
 * =========================================
 */

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
 * LINE MESSAGING API WEBHOOK
 * =========================================
 */

async function handleLineWebhook(
  request,
  env
) {
  if (!env.LINE_CHANNEL_SECRET) {
    console.error(
      "LINE_CHANNEL_SECRET is not configured"
    );

    return new Response(
      "LINE_CHANNEL_SECRET is not configured",
      {
        status: 500,
      }
    );
  }

  if (!env.LINE_CHANNEL_ACCESS_TOKEN) {
    console.error(
      "LINE_CHANNEL_ACCESS_TOKEN is not configured"
    );

    return new Response(
      "LINE_CHANNEL_ACCESS_TOKEN is not configured",
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
    console.error(
      "Missing LINE signature"
    );

    return new Response(
      "Missing LINE signature",
      {
        status: 401,
      }
    );
  }

  /*
   * ต้องใช้ raw body เดิม
   * เพื่อตรวจ LINE signature
   */
  const bodyText =
    await request.text();

  const signatureValid =
    await verifyLineSignature(
      bodyText,
      signature,
      env.LINE_CHANNEL_SECRET
    );

  if (!signatureValid) {
    console.error(
      "Invalid LINE signature"
    );

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
    console.error(
      "Invalid LINE JSON"
    );

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
    const eventType =
      cleanText(
        event?.type
      );

    const userId =
      cleanText(
        event?.source?.userId
      );

    console.log(
      "LINE webhook event:",
      eventType,
      userId
    );

    /*
     * ตอบเฉพาะ message event
     */
    if (
      eventType !== "message"
    ) {
      continue;
    }

    /*
     * ช่วงทดสอบ
     * ตอบเฉพาะข้อความตัวอักษร
     */
    if (
      event?.message?.type !== "text"
    ) {
      continue;
    }

    const replyToken =
      cleanText(
        event?.replyToken
      );

    if (!replyToken) {
      console.warn(
        "LINE replyToken not found"
      );

      continue;
    }

    const userMessage =
      cleanText(
        event?.message?.text
      );

    const replyText =
      buildLineReplyMessage(
        userMessage
      );

    try {
      await replyLineMessage(
        replyToken,
        replyText,
        env
      );

      console.log(
        "LINE reply sent successfully:",
        userId
      );

    } catch (error) {
      console.error(
        "LINE reply failed:",
        error?.message ||
        String(error)
      );
    }
  }

  /*
   * LINE ต้องได้รับ HTTP 200
   */
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


/*
 * =========================================
 * BUILD LINE REPLY MESSAGE
 * =========================================
 */

function buildLineReplyMessage(
  userMessage
) {
  const normalized =
    String(
      userMessage || ""
    )
      .trim()
      .toLowerCase();

  if (
    normalized === "ทดสอบ" ||
    normalized === "ทดสอบ webhook" ||
    normalized === "test"
  ) {
    return (
      "LIVEHUB TH ✅\n\n" +
      "ระบบ LINE Messaging API เชื่อมต่อสำเร็จแล้ว\n\n" +
      "ข้อความของคุณถูกส่งถึงระบบ LIVEHUB TH เรียบร้อย"
    );
  }

  return (
    "LIVEHUB TH 🎵\n\n" +
    "ได้รับข้อความของคุณเรียบร้อยแล้ว\n\n" +
    "ระบบกำลังเชื่อมต่อบริการคอนเสิร์ตและสิทธิ์การรับชม"
  );
}


/*
 * =========================================
 * SEND LINE REPLY MESSAGE
 * =========================================
 */

async function replyLineMessage(
  replyToken,
  text,
  env
) {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error(
      "LINE_CHANNEL_ACCESS_TOKEN is not configured"
    );
  }

  const response =
    await fetch(
      "https://api.line.me/v2/bot/message/reply",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            "Bearer " +
            env.LINE_CHANNEL_ACCESS_TOKEN,
        },

        body:
          JSON.stringify(
            {
              replyToken,

              messages: [
                {
                  type:
                    "text",

                  text:
                    String(
                      text || ""
                    ).slice(
                      0,
                      5000
                    ),
                },
              ],
            }
          ),
      }
    );

  if (response.ok) {
    return true;
  }

  let responseText = "";

  try {
    responseText =
      await response.text();
  } catch {
    responseText = "";
  }

  throw new Error(
    "LINE Messaging API error " +
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
 * VERIFY LINE WEBHOOK SIGNATURE
 * =========================================
 */

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

  const expectedSignature =
    arrayBufferToBase64(
      signatureBuffer
    );

  return constantTimeEqual(
    expectedSignature,
    receivedSignature
  );
}


/*
 * =========================================
 * BASE64 HELPER
 * =========================================
 */

function arrayBufferToBase64(
  buffer
) {
  const bytes =
    new Uint8Array(
      buffer
    );

  let binary = "";

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


/*
 * =========================================
 * CONSTANT TIME STRING COMPARE
 * =========================================
 */

function constantTimeEqual(
  firstValue,
  secondValue
) {
  const first =
    String(
      firstValue || ""
    );

  const second =
    String(
      secondValue || ""
    );

  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  let difference = 0;

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

  return difference === 0;
}
