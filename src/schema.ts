/**
 * Learn about schemas here:
 * https://jazz.tools/docs/react/schemas/covalues
 */

import { Account, CoMap, Group, Profile, co, FileStream, CoList } from "jazz-tools";

/** The account profile is an app-specific per-user public `CoMap`
 *  where you can store top-level objects for that user */
export class JazzProfile extends Profile {
  /**
   * Learn about CoValue field/item types here:
   * https://jazz.tools/docs/react/schemas/covalues#covalue-fielditem-types
   */
  firstName = co.string;
  messages = co.ref(VoiceMessageList);

  // Add public fields here
}

export class VoiceMessage extends CoMap {
  audio = co.ref(FileStream);
  createdAt = co.Date;
  creator = co.ref(JazzProfile);
  transcription = co.optional.string;
  expiresAt = co.optional.Date;
  listensLeft = co.optional.number;
  title = co.optional.string;
  // Add more fields as needed (e.g., transcription, expiresAt, listensLeft)
}

export class VoiceMessageList extends CoList.Of(co.ref(VoiceMessage)) {}

/** The account root is an app-specific per-user private `CoMap`
 *  where you can store top-level objects for that user */
export class AccountRoot extends CoMap {
  dateOfBirth = co.Date;
  // Add private fields here

  get age() {
    if (!this.dateOfBirth) return null;

    return new Date().getFullYear() - this.dateOfBirth.getFullYear();
  }
}

export class JazzAccount extends Account {
  profile = co.ref(JazzProfile);
  root = co.ref(AccountRoot);

  /** The account migration is run on account creation and on every log-in.
   *  You can use it to set up the account root and any other initial CoValues you need.
   */
  migrate(this: JazzAccount) {
    if (this.root === undefined) {
      const group = Group.create();

      this.root = AccountRoot.create(
        {
          dateOfBirth: new Date("1/1/1990"),
        },
        group,
      );
    }

    if (this.profile && this.profile.messages === undefined) {
      const group = Group.create();
      this.profile.messages = VoiceMessageList.create([], group);
    }

    if (this.profile === undefined) {
      const group = Group.create();
      group.addMember("everyone", "reader"); // The profile info is visible to everyone

      this.profile = JazzProfile.create(
        {
          name: "Anonymous user",
          firstName: "",
          messages: VoiceMessageList.create([], group),
        },
        group,
      );
    }
  }
}
