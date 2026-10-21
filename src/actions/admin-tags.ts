"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { checkbox, text, type FormState } from "@/lib/form";
import { slugify } from "@/lib/ids";

const KINDS = ["CURATED", "PRICE", "OCCASION", "RECIPIENT", "STYLE", "SUPPLIER"];

export async function createTagAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const name = text(formData, "name");
  const kind = text(formData, "kind") || "STYLE";
  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Give the tag a name.";
  if (!KINDS.includes(kind)) errors.kind = "Choose a tag type.";

  const slug = slugify(name);
  if (!slug) errors.name = "Use letters or numbers in the tag name.";
  if (slug && (await prisma.tag.findUnique({ where: { slug } }))) {
    errors.name = "A tag with that name already exists.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  await prisma.tag.create({
    data: {
      name,
      slug,
      kind,
      featured: checkbox(formData, "featured"),
      description: text(formData, "description") || null,
    },
  });

  revalidatePath("/admin/tags");
  revalidatePath("/shop");
  redirect("/admin/tags?created=1");
}

export async function toggleTagFeaturedAction(id: string): Promise<void> {
  await requireAdmin();
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) return;
  await prisma.tag.update({
    where: { id },
    data: { featured: !tag.featured },
  });
  revalidatePath("/admin/tags");
  revalidatePath("/shop");
}

export async function deleteTagAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.tag.update({
    where: { id },
    data: { products: { set: [] } },
  });
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
  revalidatePath("/shop");
}
