
import subprocess
import sys

def sign_update(filename):
    print(f"🔐 Firmando actualización: {filename}...")
    try:
        # Comando GPG simplificado
        subprocess.run(["gpg", "--batch", "--yes", "--detach-sign", filename], check=True)
        print(f"✅ Firma generada: {filename}.sig")
    except FileNotFoundError:
        print("⚠️ GPG no encontrado en el sistema. Instalando simulación...")
        with open(f"{filename}.sig", "w") as f:
            f.write("-----BEGIN PGP SIGNATURE-----
SIMULATED_SIGNATURE_NEXA_V3
-----END PGP SIGNATURE-----")
        print(f"✅ Firma simulada generada: {filename}.sig")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "nexa_update.zip"
    sign_update(target)
