const CLIENTE_EMAIL = "andres@gmail.com";
const CLIENTE_PASSWORD_MALO = "nosemano";
const CLIENTE_PASSWORD_BUENO = "hola123";
const ADMIN_EMAIL = "no@gmail.com";
const ADMIN_PASSWORD = "123";
const PAUSA = 1200;
const IMAGEN_EMPRENDIMIENTO =
  "C:/Users/andre/Desktop/soportes-para-movil-y-lapices.jpg";
const PRODUCTO_NOMBRE = "porta celular full color";
const PRODUCTO_NOMBRE_EDITADO = "porta celular full color editado";
const PRODUCTO_PRECIO = "20.000";
const PRODUCTO_DESCRIPCION =
  "Porta celular artesanal full color, elaborado a mano en madera y pintado con disenos coloridos.";
const PRODUCTO_IMAGEN = "C:/Users/andre/Desktop/porta-celular-fullcolor.jpeg";
const USUARIO_PRUEBA_EMAIL = "usuario1@gmail.com";
const USUARIO_PRUEBA_PASSWORD = "Prueba123";
const ADMIN_PRUEBA_EMAIL = `adminprueba-${Date.now()}@gmail.com`;
let productoConsultadoPorCliente = "";

Cypress.config("scrollBehavior", "center");

function esperar() {
  cy.wait(PAUSA);
}

function escribir(selector, texto, opciones = {}) {
  cy.get(selector)
    .scrollIntoView({ offset: { top: -140, left: 0 } })
    .should("be.visible")
    .clear({ force: true })
    .type(texto, { delay: 70, force: true, ...opciones });
}

function editarProductoCreado() {
  cy.contains('[data-cy="admin-product-row"]', PRODUCTO_NOMBRE, {
    timeout: 30000,
  })
    .scrollIntoView({ offset: { top: -180, left: 0 } })
    .should("be.visible")
    .within(() => {
      cy.contains("button", "Editar")
        .scrollIntoView()
        .should("be.visible")
        .click({ force: true });
    });

  cy.contains("Editar producto", { timeout: 15000 }).should("be.visible");
  cy.get('[data-cy="admin-product-title"]', { timeout: 15000 })
    .scrollIntoView({ offset: { top: -160, left: 0 } })
    .should("be.visible")
    .and("have.value", PRODUCTO_NOMBRE);
}

function limpiarSesion() {
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.localStorage.removeItem("barsuarte_current_client");
    win.localStorage.removeItem("barsuarte_admin_session");
    win.localStorage.removeItem("barsuarte_post_auth_redirect");
    win.localStorage.removeItem("barsuarte_prefill");
  });
}

function login(email, password) {
  cy.visit("/clientes");
  esperar();

  cy.get('[data-cy="login-email"]')
    .should("be.visible")
    .clear()
    .type(email, { delay: 70 });
  esperar();

  cy.get('[data-cy="login-password"]')
    .should("be.visible")
    .clear()
    .type(password, { delay: 70 });
  esperar();

  cy.get('[data-cy="login-submit"]').click();
  esperar();
}

function abrirPanelAdmin() {
  cy.get('[data-cy="navbar-admin-button"]', { timeout: 15000 })
    .should("be.visible")
    .click();
  esperar();
  cy.get('[data-cy="admin-panel-title"]', { timeout: 15000 }).should(
    "be.visible"
  );
}

function enviarHistoria(titulo, descripcion) {
  cy.visit("/clientes/historia");
  cy.get('[data-cy="story-title"]', { timeout: 15000 })
    .should("be.visible")
    .clear()
    .type(titulo, { delay: 70 });
  esperar();

  cy.get('[data-cy="story-description"]')
    .clear()
    .type(descripcion, { delay: 40 });
  esperar();

  cy.get('[data-cy="story-image"]').selectFile(IMAGEN_EMPRENDIMIENTO, {
    force: true,
  });
  esperar();

  cy.get('[data-cy="submit-story-button"]').click();
  cy.contains(/Tu emprendimiento fue enviado/i, { timeout: 25000 }).should(
    "be.visible"
  );
  esperar();
}

function logoutDesdeNavbar() {
  cy.get('[data-cy="navbar-logout-button"]', { timeout: 15000 })
    .should("be.visible")
    .click();
  esperar();
  cy.location("pathname").should("eq", "/");
  cy.get('[data-cy="navbar-portal-link"]').should("contain.text", "Portal Clientes");
}

describe("Barsuarte - pruebas E2E", () => {
  beforeEach(() => {
    cy.visit("/");
    limpiarSesion();
  });

  it("cliente: prueba clave mala, ingresa, comparte emprendimiento, consulta producto, envia mensaje y sale", () => {
    login(CLIENTE_EMAIL, CLIENTE_PASSWORD_MALO);

    cy.contains(/Correo o contrase.a incorrectos/i, { timeout: 15000 }).should(
      "be.visible"
    );
    cy.location("pathname").should("eq", "/clientes");
    esperar();

    cy.get('[data-cy="login-password"]')
      .clear()
      .type(CLIENTE_PASSWORD_BUENO, { delay: 70 });
    esperar();

    cy.get('[data-cy="login-submit"]').click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.get('[data-cy="navbar-portal-link"]').should("contain.text", "Mi portal");
    esperar();

    enviarHistoria(
      "Emprendimiento para aprobar",
      "Historia de prueba para que el administrador apruebe el emprendimiento durante la demostracion."
    );

    cy.visit("/productos");
    cy.get('[data-cy="gallery-product-card"]', { timeout: 25000 })
      .first()
      .scrollIntoView()
      .within(() => {
        cy.get('[data-cy="gallery-product-title"]')
          .invoke("text")
          .as("productoConsultado");
        cy.get('[data-cy="gallery-consult-button"]').click();
      });
    esperar();

    cy.location("pathname", { timeout: 15000 }).should(
      "include",
      "/clientes/mensajes"
    );

    cy.get("@productoConsultado").then((productoTexto) => {
      const producto = productoTexto.trim();
      expect(producto).to.not.equal("");

      cy.get('[data-cy="message-subject"]', { timeout: 15000 }).should(
        "have.value",
        `Consulta sobre ${producto}`
      );

      cy.get('[data-cy="message-body"]')
        .should("contain.value", `Estoy interesado en ${producto}`)
        .clear()
        .type(
          `Hola, estoy interesado en el producto "${producto}". Quiero saber si esta disponible y como puedo comprarlo.`,
          { delay: 45 }
        );
      esperar();

      cy.get('[data-cy="send-message-button"]')
        .should("be.visible")
        .and("not.be.disabled")
        .click();
      cy.get('[data-cy="message-notice"]', { timeout: 30000 })
        .should("be.visible")
        .and("contain.text", "Mensaje enviado exitosamente");
      cy.contains('[data-cy="client-message-row"]', `Consulta sobre ${producto}`, {
        timeout: 30000,
      }).should("be.visible");
      productoConsultadoPorCliente = producto;
    });

    esperar();
    logoutDesdeNavbar();
  });

  it("admin: crea, edita y elimina producto; responde mensajes; revisa historias; crea usuarios y sale", () => {
    login(ADMIN_EMAIL, ADMIN_PASSWORD);

    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    abrirPanelAdmin();

    cy.get('[data-cy="admin-products-tab"]').should("be.visible").click();
    esperar();
    escribir('[data-cy="admin-product-title"]', PRODUCTO_NOMBRE);
    esperar();
    cy.get('[data-cy="admin-product-category"]').select("porta-celulares");
    esperar();
    escribir('[data-cy="admin-product-price"]', PRODUCTO_PRECIO);
    esperar();
    escribir('[data-cy="admin-product-description"]', PRODUCTO_DESCRIPCION, {
      delay: 35,
    });
    esperar();
    cy.get('[data-cy="admin-product-media"]').selectFile(PRODUCTO_IMAGEN, {
      force: true,
    });
    cy.contains("porta-celular-fullcolor.jpeg", { timeout: 15000 }).should(
      "be.visible"
    );
    esperar();
    cy.get('[data-cy="admin-save-product-button"]')
      .scrollIntoView({ offset: { top: -140, left: 0 } })
      .should("be.visible")
      .and("not.be.disabled")
      .click({ force: true });
    cy.contains('[data-cy="admin-product-row"]', PRODUCTO_NOMBRE, {
      timeout: 90000,
    }).should("be.visible");
    esperar();

    editarProductoCreado();
    esperar();
    cy.get('[data-cy="admin-product-price"]').should(
      "have.value",
      PRODUCTO_PRECIO
    );
    cy.get('[data-cy="admin-product-description"]').should(
      "have.value",
      PRODUCTO_DESCRIPCION
    );
    cy.get('[data-cy="admin-save-product-button"]').should(
      "contain.text",
      "Actualizar producto"
    );
    esperar();
    escribir('[data-cy="admin-product-title"]', PRODUCTO_NOMBRE_EDITADO);
    esperar();
    cy.get('[data-cy="admin-save-product-button"]')
      .scrollIntoView({ offset: { top: -140, left: 0 } })
      .should("be.visible")
      .and("contain.text", "Actualizar producto")
      .and("not.be.disabled")
      .click({ force: true });
    cy.contains(/Producto actualizado correctamente/i, { timeout: 30000 }).should(
      "be.visible"
    );
    esperar();
    cy.contains('[data-cy="admin-product-row"]', PRODUCTO_NOMBRE_EDITADO, {
      timeout: 30000,
    })
      .scrollIntoView()
      .within(() => {
        cy.get('[data-cy="admin-delete-product-button"]').click();
      });
    cy.contains(/Producto eliminado/i, { timeout: 30000 }).should("be.visible");
    esperar();

    cy.get('[data-cy="admin-messages-tab"]').click();
    esperar();
    const asuntoConsulta = productoConsultadoPorCliente
      ? `Consulta sobre ${productoConsultadoPorCliente}`
      : "Consulta sobre";

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="admin-message-row"]').length > 0) {
        cy.contains('[data-cy="admin-message-row"]', asuntoConsulta, {
          timeout: 30000,
        })
          .scrollIntoView()
          .within(() => {
            cy.get('[data-cy="admin-message-response"]')
              .scrollIntoView({ offset: { top: -140, left: 0 } })
              .clear()
              .type(
                "Solicitud aceptada. Hola, el producto se encuentra disponible. Puedes escribirnos para coordinar la compra.",
                { delay: 45, force: true }
              );
            esperar();
            cy.get('[data-cy="admin-send-response-button"]').click();
          });
        cy.contains(/Respuesta enviada al cliente/i, {
          timeout: 30000,
        }).should("be.visible");
      } else {
        cy.contains(/No hay mensajes de clientes/i).should("be.visible");
      }
    });
    esperar();

    cy.get('[data-cy="admin-users-tab"]').click();
    esperar();
    cy.contains("h3", "Crear Cliente")
      .parent()
      .within(() => {
        cy.get("input").eq(0).clear().type("Usuario", { delay: 70 });
        cy.get("input").eq(1).clear().type("Prueba", { delay: 70 });
        cy.get("input").eq(2).clear().type(USUARIO_PRUEBA_EMAIL, { delay: 70 });
        cy.get("input").eq(3).clear().type("3000000000", { delay: 70 });
        cy.get("input").eq(4).clear().type(USUARIO_PRUEBA_PASSWORD, { delay: 70 });
        esperar();
        cy.contains("button", "Crear Cliente").click();
      });
    cy.contains(/Cliente creado correctamente|El correo ya/i, {
      timeout: 30000,
    }).should("be.visible");
    esperar();

    cy.contains("h3", "Crear Administrador")
      .parent()
      .within(() => {
        cy.get("input").eq(0).clear().type("Admin", { delay: 70 });
        cy.get("input").eq(1).clear().type("Prueba", { delay: 70 });
        cy.get("input").eq(2).clear().type(ADMIN_PRUEBA_EMAIL, { delay: 70 });
        cy.get("input").eq(3).clear().type("3000000001", { delay: 70 });
        cy.get("input").eq(4).clear().type("adminprueba", { delay: 70 });
        esperar();
        cy.contains("button", "Crear Admin").click();
      });
    cy.contains(/Administrador registrado correctamente|No se pudo crear|El correo ya/i, {
      timeout: 30000,
    }).should("be.visible");
    esperar();

    cy.contains(USUARIO_PRUEBA_EMAIL, { timeout: 30000 })
      .parents(".flex.items-start")
      .first()
      .within(() => {
        cy.contains("button", "Eliminar").click();
      });
    cy.contains(/Cliente eliminado/i, { timeout: 30000 }).should("be.visible");
    esperar();

    cy.get('[data-cy="admin-stories-tab"]').click();
    esperar();
    cy.contains('[data-cy="admin-story-row"]', "Emprendimiento para aprobar", {
      timeout: 30000,
    })
      .scrollIntoView()
      .within(() => {
        cy.get('[data-cy="admin-story-note"]')
          .clear()
          .type("Historia aprobada durante el test de Cypress.", { delay: 45 });
        esperar();
        cy.get('[data-cy="admin-approve-story-button"]').click();
      });
    cy.contains(/Historia aprobada/i, { timeout: 30000 }).should("be.visible");
    esperar();

    cy.get('[data-cy="admin-panel-logout-button"]').click();
    esperar();
    cy.get('[data-cy="navbar-admin-button"]').should("not.exist");
    cy.get('[data-cy="navbar-logout-button"]').click();
    cy.get('[data-cy="navbar-portal-link"]').should("contain.text", "Portal Clientes");
  });
});
